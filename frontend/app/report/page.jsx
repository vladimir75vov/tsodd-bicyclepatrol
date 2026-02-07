import ReportForm from "../../components/report/ReportForm.jsx";

export const metadata = {
  title: "Отчёт",
};

export default function ReportPage() {
  return (
    <main className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">Отчёт по велосипедам</h1>
        <ReportForm />
      </div>
    </main>
  );
}
