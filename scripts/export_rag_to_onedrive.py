"""
ChromaDB → JSON → SharePoint エクスポートスクリプト
事業開発部 SharePoint の AI フォルダにアップロードする。

【実行方法】
cd C:/Users/tdoi/Documents/Claude/ai-counseling-sim/backend
pip install msal requests  # 未インストールの場合
python ..\\..\\mental-health-chat\\scripts\\export_rag_to_onedrive.py ^
  --client-id <AzureADアプリのクライアントID> ^
  --tenant-id <テナントID>

【アップロード先】
  https://arm8769.sharepoint.com/sites/msteams_3eab34_280102
  Shared Documents/11　（Warm)カウンセリング利用促進/AI/counseling_knowledge.json

【Azure AD アプリ登録確認事項】
  - 認証 → パブリッククライアントフローを許可する: はい
  - APIのアクセス許可: Files.ReadWrite (委任) + offline_access
    ※ 管理者の同意不要
"""

import json
import sys
import argparse
from pathlib import Path
from datetime import datetime

# ---- アップロード先 SharePoint 設定 --------------------------------
SHAREPOINT_HOST = "arm8769.sharepoint.com"
SHAREPOINT_SITE_PATH = "/sites/msteams_3eab34_280102"
UPLOAD_FOLDER = "11\u3000\uff08Warm\uff09\u30ab\u30a6\u30f3\u30bb\u30ea\u30f3\u30b0\u5229\u7528\u4fc2\u9032/AI"
# （Warm)カウンセリング利用促進/AI
FILENAME = "counseling_knowledge.json"


def export_chromadb(chroma_path: str, collection_name: str) -> dict:
    """ChromaDB からチャンクを取得して JSON 形式に変換する。"""
    try:
        import chromadb
        from chromadb.utils import embedding_functions
    except ImportError:
        print("ERROR: chromadb が未インストールです")
        print("  pip install chromadb sentence-transformers")
        sys.exit(1)

    print(f"ChromaDB を読み込み中: {chroma_path}")
    client = chromadb.PersistentClient(path=chroma_path)

    ef = embedding_functions.SentenceTransformerEmbeddingFunction(
        model_name="paraphrase-multilingual-mpnet-base-v2"
    )

    collection = client.get_collection(
        name=collection_name,
        embedding_function=ef,
    )

    total = collection.count()
    print(f"  チャンク総数: {total}")

    result = collection.get(
        include=["documents", "metadatas"],
        limit=total,
    )

    chunks = []
    for doc, meta in zip(result["documents"], result["metadatas"]):
        text = (doc or "").strip()
        if len(text) < 50:
            continue
        chunks.append({
            "technique": meta.get("technique_category", "カウンセリング一般"),
            "issue_type": meta.get("issue_type", "general"),
            "source": meta.get("source_file", ""),
            "text": text,
        })

    print(f"  有効チャンク数: {len(chunks)}")
    return {
        "version": "1.0",
        "created": datetime.now().isoformat(),
        "chunk_count": len(chunks),
        "chunks": chunks,
    }


def get_site_id(access_token: str, requests) -> str:
    """SharePoint サイト ID を Graph API で取得する。"""
    url = (
        f"https://graph.microsoft.com/v1.0/sites/"
        f"{SHAREPOINT_HOST}:{SHAREPOINT_SITE_PATH}"
    )
    headers = {"Authorization": f"Bearer {access_token}"}
    resp = requests.get(url, headers=headers)
    if resp.status_code != 200:
        raise RuntimeError(
            f"サイトID取得失敗: {resp.status_code}\n{resp.text[:300]}"
        )
    site_id = resp.json()["id"]
    print(f"  サイトID: {site_id}")
    return site_id


def authenticate_and_upload(
    json_path: Path, client_id: str, tenant_id: str
) -> tuple[str, str, str]:
    """MSAL デバイスコードフローで認証し、SharePoint にアップロードする。"""
    try:
        import msal
        import requests
    except ImportError:
        print("ERROR: msal / requests が未インストールです")
        print("  pip install msal requests")
        sys.exit(1)

    app = msal.PublicClientApplication(
        client_id=client_id,
        authority=f"https://login.microsoftonline.com/{tenant_id}",
    )

    scopes = ["Files.ReadWrite", "offline_access"]

    # --- デバイスコードフロー ---
    flow = app.initiate_device_flow(scopes=scopes)
    if "user_code" not in flow:
        raise RuntimeError(f"デバイスフロー開始失敗: {flow}")

    print("\n" + "=" * 60)
    print(flow["message"])
    print("=" * 60)

    result = app.acquire_token_by_device_flow(flow)
    if "error" in result:
        raise RuntimeError(
            f"認証失敗: {result.get('error')}: {result.get('error_description')}"
        )

    access_token = result["access_token"]
    refresh_token = result["refresh_token"]
    print("\n認証成功 ✓")

    # --- SharePoint サイトID を取得 ---
    print("\nSharePoint サイトID を取得中...")
    site_id = get_site_id(access_token, requests)

    # --- SharePoint にアップロード ---
    upload_url = (
        f"https://graph.microsoft.com/v1.0/sites/{site_id}/drive/root:"
        f"/{UPLOAD_FOLDER}/{FILENAME}:/content"
    )
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json; charset=utf-8",
    }

    with open(json_path, "rb") as f:
        content = f.read()

    size_mb = len(content) / 1024 / 1024
    print(f"\nSharePoint にアップロード中 ({size_mb:.1f} MB)...")
    print(f"  宛先: {UPLOAD_FOLDER}/{FILENAME}")

    resp = requests.put(upload_url, headers=headers, data=content)
    if resp.status_code not in (200, 201):
        raise RuntimeError(
            f"アップロード失敗: {resp.status_code}\n{resp.text[:500]}"
        )

    item = resp.json()
    file_id = item["id"]
    print(f"アップロード完了 ✓  ファイルID: {file_id}")

    return site_id, file_id, refresh_token


def main():
    parser = argparse.ArgumentParser(
        description="ChromaDB → SharePoint RAG エクスポート"
    )
    parser.add_argument(
        "--chroma-path", default="./data/chroma_db", help="ChromaDB パス"
    )
    parser.add_argument(
        "--collection", default="counseling_techniques", help="コレクション名"
    )
    parser.add_argument(
        "--client-id", required=True, help="Azure AD アプリのクライアントID"
    )
    parser.add_argument(
        "--tenant-id", required=True, help="Azure AD テナントID"
    )
    parser.add_argument(
        "--output",
        default="./counseling_knowledge.json",
        help="ローカル出力パス（gitignore 対象）",
    )
    args = parser.parse_args()

    chroma_path = Path(args.chroma_path)
    if not chroma_path.exists():
        print(f"ERROR: ChromaDB が見つかりません: {chroma_path}")
        print("ai-counseling-sim/backend ディレクトリから実行してください")
        sys.exit(1)

    # 1. ChromaDB → JSON
    print("\n【Step 1】ChromaDB → JSON エクスポート")
    data = export_chromadb(str(chroma_path), args.collection)

    output_path = Path(args.output)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"保存: {output_path}")

    # 2. SharePoint アップロード
    print("\n【Step 2】SharePoint アップロード")
    site_id, file_id, refresh_token = authenticate_and_upload(
        output_path, args.client_id, args.tenant_id
    )

    # 3. Vercel 環境変数の出力
    print("\n" + "=" * 60)
    print("Vercel に以下の環境変数を設定してください:")
    print("（Settings → Environment Variables）")
    print("=" * 60)
    print(f"SHAREPOINT_SITE_ID={site_id}")
    print(f"ONEDRIVE_FILE_ID={file_id}")
    print(f"ONEDRIVE_TENANT_ID={args.tenant_id}")
    print(f"ONEDRIVE_CLIENT_ID={args.client_id}")
    print(f"ONEDRIVE_REFRESH_TOKEN={refresh_token}")
    print("=" * 60)
    print("\n設定後に Vercel で Redeploy を実行してください。")


if __name__ == "__main__":
    main()
