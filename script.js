document.addEventListener("DOMContentLoaded", () => {
  // 화면 요소 참조
  const inputScreen = document.getElementById("input-screen");
  const loadingScreen = document.getElementById("loading-screen");
  const resultScreen = document.getElementById("result-screen");

  // 입력 요소 참조
  const genderButtons = document.querySelectorAll(".gender-button");
  const ageInput = document.getElementById("age-input");
  const photoInput = document.getElementById("photo-input");
  const uploadArea = document.getElementById("upload-area");
  const previewImage = document.getElementById("preview-image");
  const submitButton = document.getElementById("submit-button");

  // 결과 요소 참조
  const productBrand = document.getElementById("product-brand");
  const productModel = document.getElementById("product-model");
  const productImage = document.getElementById("product-image");
  const recommendedName = document.getElementById("recommended-name");
  const productDescription = document.getElementById("product-description");
  const shareButton = document.getElementById("share-button");
  const restartButton = document.getElementById("restart-button");

  // 상태 변수
  let selectedGender = null;
  let selectedAge = null;
  let uploadedPhoto = null;
  let recommendationIndex = null;

  // 슬라이더 이미지 요소와 데이터
  const sliderImage = document.querySelector(".slider-image");
  let sliderImages = [];
  let currentImageIndex = 0;

  // 초기 데이터 로드 및 슬라이더 설정
  loadInitialData();

  async function loadInitialData() {
    try {
      const products = await loadProductData();
      sliderImages = products.map(product => product.productImage);
      if (sliderImages.length > 0) {
        sliderImage.src = sliderImages[0];
        startImageSlider();
      }
    } catch (error) {
      console.error("초기 데이터 로드 중 오류 발생:", error);
    }
  }

  function startImageSlider() {
    setInterval(() => {
      sliderImage.classList.add("fade");
      setTimeout(() => {
        currentImageIndex = (currentImageIndex + 1) % sliderImages.length;
        sliderImage.src = sliderImages[currentImageIndex];
        sliderImage.classList.remove("fade");
      }, 500);
    }, 4000);
  }

  genderButtons.forEach(button => {
    button.addEventListener("click", () => {
      genderButtons.forEach(btn => btn.classList.remove("selected"));
      button.classList.add("selected");
      selectedGender = button.dataset.gender;
      checkSubmitButton();
    });
  });

  ageInput.addEventListener("input", () => {
    const ageValue = parseInt(ageInput.value);
    if (ageValue >= 15 && ageValue <= 100) {
      selectedAge = ageValue;
      const errorMessage = document.getElementById("age-error-message");
      if (errorMessage) errorMessage.remove();
    } else if (ageInput.value !== "") {
      selectedAge = null;
      if (!document.getElementById("age-error-message")) {
        const errorMessage = document.createElement("span");
        errorMessage.id = "age-error-message";
        errorMessage.style.color = "#ff3b30";
        errorMessage.style.fontSize = "12px";
        errorMessage.style.marginRight = "5px";
        errorMessage.textContent = "15-100세만 가능";
        const ageSuffix = document.querySelector(".age-suffix");
        ageSuffix.parentNode.insertBefore(errorMessage, ageSuffix);
      }
    } else {
      selectedAge = null;
    }
    checkSubmitButton();
  });

  uploadArea.addEventListener("click", () => photoInput.click());
  uploadArea.addEventListener("dragover", e => { e.preventDefault(); uploadArea.classList.add("drag-over"); });
  uploadArea.addEventListener("dragleave", () => uploadArea.classList.remove("drag-over"));
  uploadArea.addEventListener("drop", e => {
    e.preventDefault();
    uploadArea.classList.remove("drag-over");
    if (e.dataTransfer.files.length > 0) handleFileUpload(e.dataTransfer.files[0]);
  });
  photoInput.addEventListener("change", () => {
    if (photoInput.files.length > 0) handleFileUpload(photoInput.files[0]);
  });

  function handleFileUpload(file) {
    if (!file.type.startsWith("image/")) { alert("이미지 파일만 업로드 가능합니다."); return; }
    const loadingModal = document.getElementById("loading-modal");
    loadingModal.style.display = "flex";

    const formData = new FormData();
    formData.append("file", file);
// /api/validate-face - 사람인지 아닌지 분석하여 data.valid로 데이터 전달, "/api/analyze-face" - 얼굴 감정 인종 나이 분석하여 data.shape_index로 데이터 전달
    fetch("https://pizzzaboy-deepface.hf.space/api/is-face", { method: "POST", body: formData })
      .then(res => res.json())
      .then(data => {
        loadingModal.style.display = "none";
        console.log(data.result)
        // API가 0~14 사이의 인덱스를 반환한다고 가정
        if (typeof data.result === 'number' && data.result >= 0 && data.result < 15) {
          recommendationIndex = data.result;
          console.log(data.result)
          uploadedPhoto = file;
          const reader = new FileReader();
          reader.onload = e => {
            previewImage.src = e.target.result;
            previewImage.style.display = "block";
            const uploadButtonContent = uploadArea.querySelector(".upload-button-content");
            if (uploadButtonContent) uploadButtonContent.style.display = "none";
            uploadArea.style.height = "auto";
            uploadArea.style.borderRadius = "15px";
            uploadArea.style.padding = "10px";
            checkSubmitButton();
          };
          reader.readAsDataURL(file);
        } else {
          alert("얼굴이 감지되지 않았거나, 여러 명의 얼굴이 감지되었습니다.");
        }
      })
      .catch(error => {
        loadingModal.style.display = "none";
        console.error("사진 분석 오류:", error);
        alert("서버 오류로 얼굴 판별에 실패했습니다.");
      });
  }

  function checkSubmitButton() {
    submitButton.disabled = !(selectedGender && selectedAge && uploadedPhoto && recommendationIndex !== null);
  }

  function startAnalysis() {
    inputScreen.style.display = "none";
    loadingScreen.style.display = "block";
    const analysisImage = document.getElementById("analysis-image");
    if (uploadedPhoto && previewImage.src) analysisImage.src = previewImage.src;

    const analysisText1 = document.getElementById("analysis-text-1");
    const analysisText2 = document.getElementById("analysis-text-2");
    const analysisText3 = document.getElementById("analysis-text-3");

    // Supabase에 사용자 정보 저장
    // 나이와 성별 정보 저장
    
    // 위치 정보 가져오기
    const getLocationData = () => {
      return new Promise((resolve) => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            // 성공 시 콜백
            (position) => {
              const locationData = {
                latitude: position.coords.latitude,   // 위도
                longitude: position.coords.longitude, // 경도
                accuracy: position.coords.accuracy     // 정확도(미터 단위)
              };
              console.log('위치 정보 수집 성공:', locationData);
              resolve(locationData);
            },
            // 오류 시 콜백
            (error) => {
              console.error('위치 정보 수집 실패:', error.message);
              resolve(null); // 위치 정보 없이 진행
            },
            // 옵션
            {
              enableHighAccuracy: true, // 더 정확한 위치
              timeout: 5000,            // 응답 제한 시간
              maximumAge: 0             // 캐시된 위치 정보 사용 안 함
            }
          );
        } else {
          console.error('이 브라우저에서는 위치 정보를 지원하지 않습니다.');
          resolve(null); // 위치 정보 없이 진행
        }
      });
    };
    
    // saveUserInfo 함수 호출
    // 참고: 이 부분을 실행하기 위해 supabase.js를 index.html에 포함해야 합니다
    if (typeof saveUserInfo === 'function') {
      // 위치 정보 가져오기 시도
      getLocationData().then(locationData => {
        // 위치 정보와 함께 저장 (위치 정보가 없는 경우에도 진행)
        saveUserInfo(selectedAge, selectedGender, locationData)
          .then(result => {
            console.log('Supabase 저장 결과:', result);
          })
          .catch(error => {
            console.error('Supabase 저장 오류:', error);
          });
      });
    } else {
      console.error('saveUserInfo 함수를 찾을 수 없습니다. supabase.js가 로드되었는지 확인하세요.');
    }

    analysisText1.style.display = "block";
    setTimeout(() => {
      analysisText1.style.animation = "fadeOutDown 0.3s forwards";
      setTimeout(() => {
        analysisText1.style.display = "none";
        analysisText2.style.display = "block";
        analysisText2.style.animation = "fadeInUp 0.3s forwards";
      }, 300);
    }, 3000);

    setTimeout(() => {
      analysisText2.style.animation = "fadeOutDown 0.3s forwards";
      setTimeout(() => {
        analysisText2.style.display = "none";
        analysisText3.style.display = "block";
        analysisText3.style.animation = "fadeInUp 0.3s forwards";
        setTimeout(() => {
          loadProductData().then(products => {
            const product = products.find(p => p.id.toString() === String(recommendationIndex));
            if (!product) { console.error("추천 제품을 찾을 수 없습니다."); return; }
            window.location.href = `result.html?id=${product.id}`;
          });
        }, 700);
      }, 300);
    }, 6000);
  }

  submitButton.addEventListener("click", () => startAnalysis());

  async function loadProductData() {
    try {
      const response = await fetch("data.json");
      return await response.json();
    } catch (error) {
      console.error("데이터 로드 중 오류 발생:", error);
      return [];
    }
  }

  shareButton.addEventListener("click", () => {
    const shareTitle = "맞춤 선글라스 추천";
    const shareText = `${recommendedName.textContent} - ${productBrand.textContent} ${productModel.textContent}`;
    const shareUrl = window.location.href;

    if (navigator.share) {
      navigator.share({ title: shareTitle, text: shareText, url: shareUrl })
        .then(() => console.log("공유 성공!"))
        .catch(error => { console.log("공유 중 에러 발생:", error); alert("공유 기능을 사용할 수 없습니다."); });
    } else {
      alert("이 브라우저에서는 공유 기능을 지원하지 않습니다.");
    }
  });

  restartButton.addEventListener("click", () => {
    genderButtons.forEach(btn => btn.classList.remove("selected"));
    ageInput.value = "";
    photoInput.value = "";
    previewImage.style.display = "none";
    previewImage.src = "";
    const uploadSvg = uploadArea.querySelector("svg");
    const uploadP = uploadArea.querySelector("p");
    if (uploadSvg) uploadSvg.style.display = "block";
    if (uploadP) uploadP.style.display = "block";
    selectedGender = null;
    selectedAge = null;
    uploadedPhoto = null;
    recommendationIndex = null;
    submitButton.disabled = true;
    resultScreen.style.display = "none";
    inputScreen.style.display = "block";
  });
});
