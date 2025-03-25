import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/core/storage/libsql";
import { LibSQLVector } from "@mastra/core/vector/libsql";
import {
    cloneRepositoryTool,
    readmeAnalyzerTool,
    tokeiAnalyzerTool,
    treeAnalyzerTool,
    fileProcessorTool,
    vectorQueryTool,
    saveCheatsheetTool,
} from "../tools";

// メモリの設定（LibSQLをストレージとベクターデータベースに使用）
const memory = new Memory({
    storage: new LibSQLStore({
        config: {
            url: process.env.DATABASE_URL || "file:local.db",
        },
    }),
    vector: new LibSQLVector({
        connectionUrl: process.env.DATABASE_URL || "file:local.db",
    }),
    options: {
        lastMessages: 30, // 会話履歴の保持数を増やす（10→30）
        semanticRecall: {
            topK: 5, // より多くの関連メッセージを取得（3→5）
            messageRange: 3, // コンテキスト範囲を拡大（2→3）
        },
        workingMemory: {
            enabled: true, // ワーキングメモリを有効化
        },
    },
});