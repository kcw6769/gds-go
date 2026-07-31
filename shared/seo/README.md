# GDS SEO 공통 시스템

새 랜딩페이지 SEO는 **페이지별 6항목만** 수정하면 됩니다.  
목표는 5분 안에 설정 완료입니다.

---

## 폴더 구조

```
shared/seo/
├── README.md                  ← 이 파일
├── common.html                ← 공통 (수정 금지)
├── page.html                  ← 페이지별 (여기만 수정)
├── schema-organization.html   ← 공통 Schema (수정 금지)
├── schema-breadcrumb.html     ← 선택 (경로명만 수정)
└── schema-faq.html            ← 선택 (FAQ 있을 때만)
```

---

## 새 랜딩페이지 제작 순서 (5분)

### 1) 공통 블록 붙여넣기 (수정 없음)

`<head>` 안에 아래를 **그대로** 넣습니다.

1. `shared/seo/common.html`
2. `shared/seo/schema-organization.html`

### 2) 페이지 블록 붙여넣고 6항목만 수정

`shared/seo/page.html` 을 붙여넣은 뒤 아래만 교체합니다.

| # | 항목 | 예시 |
|---|------|------|
| 1 | `title` | `목 큰 점 제거 \| 지디에스 성형외과` |
| 2 | `meta description` | 진료 요약 1~2문장 (과장 금지) |
| 3 | `canonical` / `og:url` | `https://gdsprs.com/big-nevus/` |
| 4 | `og:title` | SNS용 제목 |
| 5 | `og:description` | SNS용 설명 |
| 6 | `og:image` | `https://gdsprs.com/.../og.jpg` (1200×630) |

> `twitter:*` 와 `WebPage` JSON-LD는 위 값과 동일 플레이스홀더를 쓰므로 **따로 작성하지 않습니다.**

### 3) Breadcrumb 추가 (권장 · 1분)

`shared/seo/schema-breadcrumb.html` 을 넣고 **마지막 항목만** 수정합니다.

- `name` → 진료명 (예: 큰 점 제거)
- `item` → canonical URL

### 4) FAQ 추가 (FAQ 섹션이 있을 때만)

`shared/seo/schema-faq.html` 을 넣고 질문·답변만 화면 문구와 동일하게 맞춥니다.

### 5) Footer

- CSS: `shared/footer.css`
- HTML: `shared/footer.html`

---

## 체크리스트 (복사해서 사용)

```
[ ] common.html 포함 (수정 안 함)
[ ] schema-organization.html 포함 (수정 안 함)
[ ] title
[ ] meta description
[ ] canonical URL
[ ] og:title
[ ] og:description
[ ] og:image
[ ] breadcrumb 마지막 name / URL
[ ] FAQ (있을 때만)
[ ] footer.html + footer.css
[ ] 의료광고법: 보장·확정·최상급 표현 없음
```

---

## 수정하면 안 되는 파일

| 파일 | 이유 |
|------|------|
| `common.html` | charset, viewport, robots, favicon, OG site_name, Twitter card 타입 |
| `schema-organization.html` | Organization / MedicalClinic / WebSite |

병원 주소·전화·이름이 바뀌면 → `schema-organization.html` 과 `common.html` 만 수정하고 모든 랜딩에 반영합니다.

---

## Head 조립 순서 (권장)

```html
<head>
  <!-- 1. 공통 -->
  <!-- shared/seo/common.html -->

  <!-- 2. 페이지별 (6항목만 수정) -->
  <!-- shared/seo/page.html -->

  <!-- 3. 공통 Schema -->
  <!-- shared/seo/schema-organization.html -->

  <!-- 4. 선택 Schema -->
  <!-- shared/seo/schema-breadcrumb.html -->
  <!-- shared/seo/schema-faq.html -->

  <!-- 5. CSS -->
</head>
```
