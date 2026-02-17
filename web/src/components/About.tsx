

import Image from 'next/image';
import aboutImage from '../images/image.png';

export function About() {
    return (
        <section id="about" className="py-20 relative overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row items-center gap-12">
                    <div className="w-full md:w-1/2 relative">
                        <div className="aspect-square rounded-3xl bg-gradient-to-br from-surface-elevated to-surface border border-surface-elevated relative overflow-hidden flex items-center justify-center p-8">
                            <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
                            <div className="relative z-10 w-full h-full flex items-center justify-center">
                                <Image
                                    src={aboutImage}
                                    alt="Ilustración 3D de comunidad compartiendo comida"
                                    className="object-contain rounded-xl shadow-2xl"
                                    fill
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    placeholder="blur"
                                />
                            </div>

                            {/* Decorative elements */}
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl"></div>
                            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl"></div>
                        </div>
                    </div>

                    <div className="w-full md:w-1/2">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-text-main">
                            Más que una guía, <br />
                            <span className="text-primary">tu compañero gastronómico.</span>
                        </h2>
                        <p className="text-text-secondary mb-6 leading-relaxed">
                            Bokitas nació con la misión de conectar a los amantes de la comida con los mejores sabores locales. No vendemos comida; celebramos la cultura culinaria y damos voz a cada comensal.
                        </p>
                        <p className="text-text-secondary mb-8 leading-relaxed">
                            Creamos un espacio donde tu opinión importa. Descubre nuevos sabores, evita malas experiencias y encuentra exactamente lo que se te antoja, validado por una comunidad de expertos como tú.
                        </p>

                        {/* <div className="flex gap-4">
                            <div className="flex flex-col">
                                <span className="text-3xl font-bold text-primary">1M+</span>
                                <span className="text-sm text-text-muted">Reseñas Compartidas</span>
                            </div>
                            <div className="w-px h-12 bg-surface-elevated"></div>
                            <div className="flex flex-col">
                                <span className="text-3xl font-bold text-primary">50+</span>
                                <span className="text-sm text-text-muted">Ciudades</span>
                            </div>
                        </div> */}
                    </div>
                </div>
            </div>
        </section>
    );
}
