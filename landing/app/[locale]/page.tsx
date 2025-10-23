import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import Demo from '@/components/Demo';
import Pricing from '@/components/Pricing';
import Downloads from '@/components/Downloads';
import FAQ from '@/components/FAQ';
import Footer from '@/components/Footer';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <Demo />
      <Pricing />
      <Downloads />
      <FAQ />
      <Footer />
    </main>
  );
}
