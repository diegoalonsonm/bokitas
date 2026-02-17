"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { List, X } from "react-bootstrap-icons";
import { Button } from "@/components/Button/Button";
import Logo from "@/images/logo.png";
import { NavLink } from "./Navbar.types";

const navLinks: NavLink[] = [
    { name: "Inicio", href: "#hero" },
    { name: "Características", href: "#features" },
    { name: "Nosotros", href: "#about" },
];

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-[background-color,border-color,padding] duration-300 ${isScrolled
                    ? "bg-background/80 backdrop-blur-md border-b border-surface-elevated py-2"
                    : "bg-transparent py-4"
                }`}
        >
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="relative w-10 h-10 overflow-hidden rounded-xl transition-transform group-hover:scale-105">
                            <Image
                                src={Logo}
                                alt="Bokitas Logo"
                                fill
                                className="object-cover"
                                sizes="40px"
                            />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-light">
                            Bokitas
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        <div className="flex items-center gap-6">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className="text-sm font-medium text-text-secondary hover:text-primary transition-colors"
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                        <Button size="sm" href="#download">
                            Descargar App
                        </Button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 text-text-main hover:text-primary transition-colors"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
                        aria-expanded={isMobileMenuOpen}
                    >
                        {isMobileMenuOpen ? <X size={24} aria-hidden="true" /> : <List size={24} aria-hidden="true" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 bg-background border-b border-surface-elevated p-4 shadow-xl animate-in slide-in-from-top-4">
                    <div className="flex flex-col gap-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-base font-medium text-text-secondary hover:text-primary transition-colors py-2"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <Button
                            className="w-full mt-2"
                            href="#download"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Descargar App
                        </Button>
                    </div>
                </div>
            )}
        </nav>
    );
}
