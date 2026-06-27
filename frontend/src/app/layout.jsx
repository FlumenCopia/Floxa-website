import { Jost } from 'next/font/google';
import '../styles/globals.css';
import { Providers } from '@/components/layout/Providers';
import { Toaster } from 'react-hot-toast';
const jost = Jost({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700', '800'],
    variable: '--font-jost',
    display: 'swap',
});
export const metadata = {
    title: 'FLOXA — Clarity Before Creation',
    description: 'Brand discovery and client onboarding platform by FlumenX',
    icons: { icon: '/assets/favicon.svg' },
    openGraph: {
        title: 'FLOXA',
        description: 'Clarity Before Creation™',
        url: 'https://floxa.io',
        siteName: 'FLOXA',
        type: 'website',
    },
};
export default function RootLayout({ children }) {
    return (<html lang="en" className={jost.variable}>
      <body>
        {/* Ambient background blobs */}
        <div className="floxa-ambient" aria-hidden="true">
          <div className="floxa-blob floxa-blob-1"/>
          <div className="floxa-blob floxa-blob-2"/>
          <div className="floxa-blob floxa-blob-3"/>
        </div>

        <Providers>
          {children}
        </Providers>

        <Toaster position="bottom-right" toastOptions={{
            style: {
                background: 'rgba(28,52,46,0.97)',
                border: '1px solid rgba(77,255,160,0.25)',
                color: '#4DFFA0',
                fontFamily: 'var(--font-jost)',
                fontSize: '13px',
            },
        }}/>
      </body>
    </html>);
}
