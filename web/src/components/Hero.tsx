import { Button } from "./Button";
import { ArrowRight, Star } from "lucide-react";


export function Hero() {
    return (
        <section
            id="hero"
            className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden flex items-center justify-center min-h-[80vh]"
        >
            {/* Background Effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-[100px] opacity-50 animate-pulse" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-dark/10 rounded-full blur-[120px] opacity-30" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-elevated/50 border border-surface-elevated mb-8 backdrop-blur-sm animate-fade-in-up">
                        <span className="flex h-2 w-2 rounded-full bg-success"></span>
                        <span className="text-xs font-medium text-text-secondary">
                            Únete a la comunidad foodie más grande
                        </span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-text-main to-text-secondary animate-fade-in-up delay-100">
                        Descubre y comparte <br />
                        <span className="text-primary">las mejores experiencias.</span>
                    </h1>

                    <p className="text-lg md:text-xl text-text-secondary mb-10 max-w-2xl animate-fade-in-up delay-200 leading-relaxed">
                        Explora los restaurantes más auténticos, lee reseñas honestas y comparte tus propios descubrimientos. La guía definitiva para tu paladar.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto animate-fade-in-up delay-300">
                        <Button size="lg" className="w-full sm:w-auto group">
                            Empezar a Explorar
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                    </div>

                    {/* <div className="mt-12 flex items-center gap-8 text-text-muted animate-fade-in-up delay-400">
                        <div className="flex flex-col items-center">
                            <span className="text-2xl font-bold text-text-main">500+</span>
                            <span className="text-xs">Restaurantes</span>
                        </div>
                        <div className="w-px h-8 bg-surface-elevated"></div>
                        <div className="flex flex-col items-center">
                            <span className="text-2xl font-bold text-text-main">10k+</span>
                            <span className="text-xs">Reseñas Reales</span>
                        </div>
                        <div className="w-px h-8 bg-surface-elevated"></div>
                        <div className="flex flex-col items-center">
                            <div className="flex items-center gap-1 text-gold">
                                <span className="text-2xl font-bold text-text-main">4.9</span>
                                <Star className="h-4 w-4 fill-current" />
                            </div>
                            <span className="text-xs">Calificación App</span>
                        </div>
                    </div> */}
                </div>
            </div>
        </section>
    );
}

