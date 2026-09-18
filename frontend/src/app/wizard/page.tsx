import { WizardHeadlessForm } from "@/components/wizard/WizardHeadlessForm";

export default function WizardPage() {
  return (
    <main>
      <h1>建立新行程</h1>
      <p>階段 1 無樣式資料邏輯驗證頁。</p>
      <WizardHeadlessForm />
    </main>
  );
}
