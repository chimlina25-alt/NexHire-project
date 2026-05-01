import { EmployerProfileProvider } from "@/context/EmployerProfileContext";

export default function EmployerLayout({ children }: { children: React.ReactNode }) {
  return (
    <EmployerProfileProvider>
      {children}
    </EmployerProfileProvider>
  );
}