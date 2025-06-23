import Hero from "@/components/Hero";
import GamesSection from "@/components/GamesSection";
import About from "@/components/About";

export default function Home() {
  return (
    <main className="bg-black">
      <Hero />
      <GamesSection />
      <About />
      {/* Здесь будут другие секции сайта */}
    </main>
  );
}
