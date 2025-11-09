export async function handleApiResponse(response: Response) {
  // 步驟 1: 檢查 HTTP 狀態碼是否成功
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      error: { message: `HTTP error! Status: ${response.status}` },
    }));
    throw new Error(
      errorData.error?.message || "An unknown network error occurred"
    );
  }

  const data = await response.json();

  // 步驟 2: 檢查後端回傳的業務邏輯是否成功
  if (data.success === false) {
    throw new Error(data.error?.message || "An API error occurred");
  }

  // 步驟 3: 回傳核心資料，如果沒有則提供一個安全的預設值
  return data.data || null; // 使用 null 或 [] 取決於你對 API 的預期
}
