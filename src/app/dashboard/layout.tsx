import Sidebar from "@/components/Sidebar";
import BotFloatingControl from "@/components/BotFloatingControl";
import ToastContainer from "@/components/ToastContainer";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen" style={{ background: '#07070f' }}>
      <Sidebar />
      <main className="flex-1 ml-64 min-h-screen overflow-y-auto">
        <div className="p-6 max-w-[1400px] mx-auto">
          {children}
        </div>
      </main>
      <BotFloatingControl />
      <ToastContainer />
    </div>
  );
}
