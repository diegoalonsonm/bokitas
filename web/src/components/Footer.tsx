import Link from "next/link";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-surface border-t border-surface-elevated pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="md:col-span-1">
                        <h3 className="text-2xl font-bold text-primary mb-4">Bokitas</h3>
                        <p className="text-text-muted text-sm leading-relaxed">
                            La comunidad donde la comida cobra vida. Descubre, califica y comparte tus experiencias culinarias.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold text-text-main mb-4">Síguenos</h4>
                        <div className="flex gap-4">
                            <Link href="#" className="text-text-secondary hover:text-primary transition-colors">
                                <Instagram size={20} />
                            </Link>
                            <Link href="https://linkedin.com/in/diegonaranjo03/" className="text-text-secondary hover:text-primary transition-colors">
                                <Linkedin size={20} />
                            </Link>
                        </div>
                        <div className="mt-4 text-sm text-text-muted">
                            <p>Ayuda: soporte@bokitas.com</p>
                        </div>
                    </div>
                </div>

                <div className="border-t border-surface-elevated pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-text-muted text-sm">
                        &copy; {currentYear} Bokitas Inc. Todos los derechos reservados.
                    </p>
                    <div className="flex gap-6">
                        <Link href="/privacy" className="text-text-muted hover:text-text-main text-sm transition-colors">
                            Privacidad
                        </Link>
                        <Link href="/service" className="text-text-muted hover:text-text-main text-sm transition-colors">
                            Términos
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
