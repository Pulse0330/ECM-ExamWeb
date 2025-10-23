// src/types/examfinish.ts

export interface ExamFinishRequest {
  exam_id: number;
  exam_type: number;
  start_eid: number;
  exam_time: number;
  user_id: number;
}

export interface ExamFinishResponse {
  RetResponse: {
    ResponseMessage: string;
    StatusCode: string;
    ResponseCode: string;
    ResponseType: boolean;
  };
  RetData: number; // This is the test_id
}

/**
 * Extract test_id from response
 * @returns test_id (RetData is directly the test_id number)
 */
export function getTestIdFromResponse(
  response: ExamFinishResponse
): number | null {
  if (typeof response.RetData === "number" && response.RetData > 0) {
    console.log("✅ Test ID олдлоо:", response.RetData);
    return response.RetData;
  }
  console.warn("⚠️ Test ID олдсонгүй. Response:", response);
  return null;
}

/**
 * Check if exam was successfully submitted
 * StatusCode "200" means success
 */
export function isExamSubmitSuccess(response: ExamFinishResponse): boolean {
  return (
    response.RetResponse.StatusCode === "200" &&
    response.RetResponse.ResponseType === true
  );
}

/**
 * Get success/error message from response
 */
export function getResponseMessage(response: ExamFinishResponse): string {
  return response.RetResponse.ResponseMessage || "Алдаа гарлаа";
}