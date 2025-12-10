export async function handleApiResponse(response: Response) {
  // Step 1: Check if the HTTP status code indicates success
  if (!response.ok) {
    let errorMessage = `HTTP error! Status: ${response.status}`;
    try {
      const errorData = await response.json();
      // Prefer the structured error message from our standard format
      errorMessage =
        errorData?.error?.message ||
        errorData?.message || // Handle legacy formats
        JSON.stringify(errorData);
    } catch (e) {
      // If parsing fails, use the status text
      errorMessage = response.statusText;
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();

  // Step 2: Check the business logic success flag from the backend
  if (data.success === false) {
    throw new Error(data.error?.message || "An API error occurred");
  }
  // Step 3: Return the core data. It might be null for success responses without data.
  return data.data;
}
