document.addEventListener("DOMContentLoaded", async () => {
  // 분석 완료 플래그 확인
  const accessGranted = sessionStorage.getItem("analysisCompleted");

  if (!accessGranted) {
    alert("분석을 먼저 진행해주세요.");
    window.location.href = "index.html";
    return;
  }

  const productBrand = document.getElementById("product-brand");
  const productModel = document.getElementById("product-model");
  const productImage = document.getElementById("product-image");
  const recommendedName = document.getElementById("recommended-name");
  const productDescription = document.getElementById("product-description");
  const shareButton = document.getElementById("share-button");
  const restartButton = document.getElementById("restart-button");

  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");

  if (!productId) {
    alert("잘못된 접근입니다. 메인 페이지로 이동합니다.");
    window.location.href = "index.html";
    return;
  }

  try {
    const products = await loadProductData();
    const selectedProduct = products.find(p => p.id.toString() === productId);
    if (!selectedProduct) {
      alert("해당 제품을 찾을 수 없습니다. 메인 페이지로 이동합니다.");
      window.location.href = "index.html";
      return;
    }

    updateResultScreen(selectedProduct);
  } catch (error) {
    console.error("데이터 로드 중 오류:", error);
    alert("데이터를 불러오는 중 오류가 발생했습니다. 메인 페이지로 이동합니다.");
    window.location.href = "index.html";
  }

  async function loadProductData() {
    const response = await fetch("data.json");
    return await response.json();
  }

  function updateResultScreen(product) {
    productBrand.textContent = product.brandName;
    productModel.textContent = product.modelNumber;
    productImage.src = product.productImage;
    recommendedName.textContent = product.recommendedName;
    productDescription.textContent = product.description;

    const productLink = document.getElementById("product-link");
    productLink.href = product.detailUrl || "https://www.gentlemonster.com/kr/ko/category/sunglasses/view-all";
    productLink.target = "_blank";
  }

  shareButton.addEventListener("click", () => {
    const shareTitle = "맞춤 선글라스 추천";
    const shareText = `${recommendedName.textContent} - ${productBrand.textContent} ${productModel.textContent}`;
    const shareUrl = window.location.href;

    if (navigator.share) {
      navigator.share({ title: shareTitle, text: shareText, url: shareUrl })
        .then(() => console.log("공유 성공!"))
        .catch((error) => {
          console.log("공유 중 에러 발생:", error);
          alert("공유 기능을 사용할 수 없습니다.");
        });
    } else {
      alert("이 브라우저에서는 공유 기능을 지원하지 않습니다.");
    }
  });

  restartButton.addEventListener("click", () => {
    window.location.href = "index.html";
  });
});
