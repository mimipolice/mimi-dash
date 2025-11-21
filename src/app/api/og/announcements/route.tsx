import { ImageResponse } from "@vercel/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0a",
          padding: "60px 80px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Logo/Brand */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
            marginBottom: "48px",
          }}
        >
          <div
            style={{
              width: "12px",
              height: "80px",
              backgroundColor: "#3b82f6",
              borderRadius: "6px",
            }}
          />
          <div
            style={{
              fontSize: 56,
              fontWeight: 800,
              color: "#ffffff",
              letterSpacing: "-0.02em",
            }}
          >
            MimiDLC
          </div>
        </div>

        {/* Main Title */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 900,
            color: "#ffffff",
            textAlign: "center",
            marginBottom: "24px",
            letterSpacing: "-0.03em",
          }}
        >
          最新公告
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 32,
            color: "#a1a1aa",
            textAlign: "center",
            maxWidth: "80%",
          }}
        >
          查看最新的系統更新、維護通知和重要資訊
        </div>

        {/* Decorative elements */}
        <div
          style={{
            position: "absolute",
            bottom: "60px",
            right: "80px",
            display: "flex",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              backgroundColor: "#3b82f6",
              borderRadius: "50%",
              opacity: 0.2,
            }}
          />
          <div
            style={{
              width: "60px",
              height: "60px",
              backgroundColor: "#f59e0b",
              borderRadius: "50%",
              opacity: 0.2,
            }}
          />
          <div
            style={{
              width: "60px",
              height: "60px",
              backgroundColor: "#ef4444",
              borderRadius: "50%",
              opacity: 0.2,
            }}
          />
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
