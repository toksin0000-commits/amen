import '../globals.css';
import RootLayoutClient from '../RootLayoutClient';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs" dir="ltr">
      <body className="min-h-screen flex flex-col text-[#222]">
        <RootLayoutClient>
          {children}
        </RootLayoutClient>
      </body>
    </html>
  );
}
