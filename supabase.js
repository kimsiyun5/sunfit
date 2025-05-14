// 3단계에서 복사한 Supabase URL과 anon key를 여기에 입력하세요.
const SUPABASE_URL = "https://ipktoobcfmdjynmftnmr.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlwa3Rvb2JjZm1kanlubWZ0bm1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3NzM0MjgsImV4cCI6MjA2MjM0OTQyOH0.Qkn5SfnrmNeDKwd9Dfvy9Da4LhOU2Z8HzooIHHkslnk";

// Supabase 클라이언트 초기화
const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log("Supabase 클라이언트 초기화 완료:", supabase);

// 사용자 정보 저장 함수
async function saveUserInfo(age, gender) {
  // 입력값 검증
  if (!age || !gender) {
    console.error("나이와 성별은 필수 입력값입니다.");
    return { success: false, message: "나이와 성별을 모두 입력해주세요." };
  }

  // 나이가 숫자인지 확인
  const ageNumber = parseInt(age);
  if (isNaN(ageNumber)) {
    console.error("나이는 숫자로 입력해야 합니다.");
    return { success: false, message: "나이는 숫자로 입력해주세요." };
  }

  // 저장할 데이터 객체 생성
  const userData = {
    age: ageNumber,
    gender: gender,
  };

  try {
    // Supabase 테이블에 데이터 삽입
    const { data, error } = await client
      .from("sunfit") // 테이블 이름이 다르다면 수정해주세요
      .insert([userData])
      .select();

    if (error) {
      console.error("데이터 저장 오류:", error);
      return { success: false, message: `데이터 저장 실패: ${error.message}` };
    } else {
      console.log("데이터 저장 성공:", data);
      return {
        success: true,
        message: "데이터가 성공적으로 저장되었습니다!",
        data: data,
      };
    }
  } catch (err) {
    console.error("예상치 못한 오류:", err);
    return { success: false, message: `예상치 못한 오류 발생: ${err.message}` };
  }
}
