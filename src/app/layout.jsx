import "@/styles/globals.css";

export const metadata = {
  title: "기억의 정원",
  description: "중장년층을 위한 매일 5분 두뇌 훈련 앱",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
