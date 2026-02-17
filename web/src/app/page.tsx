import { Navbar } from "@/components/Navbar/Navbar";
import { Hero } from "@/components/Hero/Hero";
import { Features } from "@/components/Features/Features";
import { About } from "@/components/About/About";
import { Footer } from "@/components/Footer/Footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <About />
      <Footer />
    </main>
  );
}
