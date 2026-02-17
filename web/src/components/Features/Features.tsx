import { EggFried, StarFill, CameraFill, PeopleFill } from "react-bootstrap-icons";
import { Feature } from "./Features.types";

const features: Feature[] = [
    {
        icon: EggFried,
        title: "Descubrimiento Local",
        description:
            "Encuentra joyas ocultas y los lugares más populares de tu ciudad. Filtra por antojo, precio o cercanía.",
    },
    {
        icon: StarFill,
        title: "Reseñas Honestas",
        description:
            "Opiniones reales de usuarios reales. Sin filtros ni patrocinios, solo la verdad sobre cada platillo.",
    },
    {
        icon: CameraFill,
        title: "Comparte tu Experiencia",
        description:
            "Sube fotos, califica el servicio y cuenta tu historia. Ayuda a otros a decidir dónde comer hoy.",
    },
    {
        icon: PeopleFill,
        title: "Comunidad Activa",
        description:
            "Sigue a tus foodies favoritos, comenta en sus reseñas y crea tu propia lista de lugares por visitar.",
    },
];

export function Features() {
    return (
        <section id="features" className="py-20 bg-surface">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-text-main">
                        ¿Por qué elegir <span className="text-primary">Bokitas</span>?
                    </h2>
                    <p className="text-text-secondary">
                        Diseñamos una experiencia pensada en ti, para que solo te preocupes por disfrutar.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="p-6 rounded-2xl bg-surface-elevated/50 border border-surface-elevated hover:bg-surface-elevated transition-colors group"
                        >
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                                <feature.icon className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-text-main">
                                {feature.title}
                            </h3>
                            <p className="text-text-secondary text-sm leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
