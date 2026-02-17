import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Politica de Privacidad - Bokitas",
  description:
    "Politica de privacidad de Bokitas. Conoce como manejamos tu informacion personal.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen">
      <Navbar />

      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Politica de Privacidad de Bokitas
          </h1>

          <p className="text-text-secondary mb-8">
            <strong>Ultima actualizacion:</strong> 17 de febrero de 2026
          </p>

          <div className="prose prose-invert max-w-none space-y-8 text-text-secondary leading-relaxed">
            <p>
              Bokitas (&quot;nosotros&quot;, &quot;la aplicacion&quot;) es una
              aplicacion movil para descubrir, calificar y resenar restaurantes
              en Costa Rica. Tu privacidad es importante para nosotros. Esta
              politica describe que informacion recopilamos, como la usamos y
              cuales son tus derechos.
            </p>

            <p>
              Al usar Bokitas, aceptas las practicas descritas en esta politica.
            </p>

            <hr className="border-surface-elevated" />

            {/* Section 1 */}
            <h2 className="text-2xl font-bold text-text-main">
              1. Informacion que Recopilamos
            </h2>

            <h3 className="text-xl font-semibold text-text-main">
              1.1 Informacion que vos nos brindas directamente
            </h3>

            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Registro de cuenta:</strong> nombre, primer apellido,
                segundo apellido (opcional), correo electronico y contrasena.
              </li>
              <li>
                <strong>Perfil de usuario:</strong> nombre de usuario (opcional)
                y foto de perfil.
              </li>
              <li>
                <strong>Resenas:</strong> calificacion (1-5), comentario de
                texto y fotografias de restaurantes (hasta 5 por resena).
              </li>
              <li>
                <strong>Listas de restaurantes (Eatlists):</strong> nombre de la
                lista y restaurantes seleccionados.
              </li>
              <li>
                <strong>Autenticacion con Google:</strong> si elegis iniciar
                sesion con Google, recibimos tu nombre, correo electronico y
                foto de perfil de tu cuenta de Google. No accedemos a tus
                contactos, calendario ni otros datos de Google.
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-text-main">
              1.2 Informacion recopilada automaticamente
            </h3>

            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Ubicacion:</strong> solicitamos acceso a tu ubicacion
                GPS para mostrar restaurantes cercanos en el mapa y mejorar los
                resultados de busqueda. Este permiso es opcional y se solicita
                explicitamente en el dispositivo. Podemos enviar tus coordenadas
                a nuestro servidor para buscar restaurantes cercanos, pero no
                almacenamos un historial de tu ubicacion.
              </li>
              <li>
                <strong>Tokens de autenticacion:</strong> almacenamos un token
                de sesion (JWT) de forma segura y encriptada en tu dispositivo
                para mantener tu sesion activa.
              </li>
              <li>
                <strong>Cache local:</strong> almacenamos datos no sensibles en
                tu dispositivo de forma temporal para mejorar el rendimiento de
                la aplicacion.
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-text-main">
              1.3 Informacion que NO recopilamos
            </h3>

            <ul className="list-disc pl-6 space-y-2">
              <li>No recopilamos datos de analitica ni telemetria.</li>
              <li>No mostramos publicidad ni usamos SDKs publicitarios.</li>
              <li>
                No accedemos a tus contactos, mensajes ni historial de
                navegacion.
              </li>
              <li>
                No recopilamos datos de pago ni informacion financiera (Bokitas
                es gratuita y no tiene compras dentro de la aplicacion).
              </li>
              <li>
                Al ser una aplicacion movil nativa, no utilizamos cookies.
              </li>
            </ul>

            <hr className="border-surface-elevated" />

            {/* Section 2 */}
            <h2 className="text-2xl font-bold text-text-main">
              2. Como Usamos tu Informacion
            </h2>

            <p>
              Utilizamos la informacion recopilada unicamente para:
            </p>

            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Crear y gestionar tu cuenta</strong> en Bokitas.
              </li>
              <li>
                <strong>Mostrar tu perfil</strong> y tus resenas a otros
                usuarios.
              </li>
              <li>
                <strong>Buscar restaurantes cercanos</strong> utilizando tu
                ubicacion.
              </li>
              <li>
                <strong>Almacenar tus resenas y fotos</strong> para que otros
                usuarios puedan consultarlas.
              </li>
              <li>
                <strong>Gestionar tus listas de restaurantes</strong> (Eatlists).
              </li>
              <li>
                <strong>Autenticar tu identidad</strong> y proteger tu cuenta.
              </li>
              <li>
                <strong>Mejorar la aplicacion</strong> con base en las funciones
                que se utilizan.
              </li>
            </ul>

            <p>
              No vendemos, alquilamos ni compartimos tu informacion personal con
              terceros con fines de marketing o publicidad.
            </p>

            <hr className="border-surface-elevated" />

            {/* Section 3 */}
            <h2 className="text-2xl font-bold text-text-main">
              3. Servicios de Terceros
            </h2>

            <p>
              Para el funcionamiento de Bokitas utilizamos los siguientes
              servicios de terceros:
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-surface-elevated rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-surface-elevated text-text-main">
                    <th className="text-left p-3 font-semibold">Servicio</th>
                    <th className="text-left p-3 font-semibold">Proveedor</th>
                    <th className="text-left p-3 font-semibold">Proposito</th>
                    <th className="text-left p-3 font-semibold">
                      Datos compartidos
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-elevated">
                  <tr>
                    <td className="p-3 font-semibold">Supabase</td>
                    <td className="p-3">Supabase Inc.</td>
                    <td className="p-3">
                      Base de datos, autenticacion y almacenamiento de archivos
                    </td>
                    <td className="p-3">
                      Datos de cuenta, resenas, fotos de perfil y de resenas
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold">
                      Foursquare Places API
                    </td>
                    <td className="p-3">Foursquare Labs Inc.</td>
                    <td className="p-3">
                      Busqueda y descubrimiento de restaurantes
                    </td>
                    <td className="p-3">
                      Coordenadas de ubicacion y terminos de busqueda (sin datos
                      personales)
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold">Google Sign-In</td>
                    <td className="p-3">Google LLC</td>
                    <td className="p-3">Inicio de sesion social</td>
                    <td className="p-3">
                      Credenciales OAuth (nombre, correo, foto de perfil)
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold">Google Maps</td>
                    <td className="p-3">Google LLC</td>
                    <td className="p-3">Visualizacion de mapas</td>
                    <td className="p-3">
                      Coordenadas de ubicacion para mostrar el mapa
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p>
              Cada uno de estos proveedores tiene sus propias politicas de
              privacidad. Te recomendamos revisarlas:
            </p>

            <ul className="list-disc pl-6 space-y-2">
              <li>
                <a
                  href="https://supabase.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary-light transition-colors underline"
                >
                  Supabase Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="https://foursquare.com/legal/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary-light transition-colors underline"
                >
                  Foursquare Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary-light transition-colors underline"
                >
                  Google Privacy Policy
                </a>
              </li>
            </ul>

            <hr className="border-surface-elevated" />

            {/* Section 4 */}
            <h2 className="text-2xl font-bold text-text-main">
              4. Almacenamiento y Seguridad de los Datos
            </h2>

            <ul className="list-disc pl-6 space-y-2">
              <li>
                Tu contrasena se almacena de forma encriptada y nunca es visible
                para nosotros ni para otros usuarios.
              </li>
              <li>
                Los tokens de sesion se guardan de forma segura en el
                almacenamiento encriptado de tu dispositivo (Secure Store).
              </li>
              <li>
                Las fotos de perfil y de resenas se almacenan en servidores
                seguros de Supabase.
              </li>
              <li>
                Implementamos validaciones en el servidor para proteger la
                integridad de los datos (limites de tamano de archivos, tipos de
                archivo permitidos, validacion de entradas).
              </li>
            </ul>

            <p>
              Aunque tomamos medidas razonables para proteger tu informacion,
              ningun sistema es completamente seguro. No podemos garantizar la
              seguridad absoluta de tus datos.
            </p>

            <hr className="border-surface-elevated" />

            {/* Section 5 */}
            <h2 className="text-2xl font-bold text-text-main">
              5. Retencion de Datos
            </h2>

            <ul className="list-disc pl-6 space-y-2">
              <li>
                Conservamos tu informacion personal mientras tu cuenta este
                activa.
              </li>
              <li>
                Tus resenas y fotos publicadas permanecen visibles mientras no
                las elimines.
              </li>
              <li>
                Al eliminar tu cuenta, realizamos una eliminacion logica (soft
                delete) de tus datos. Tus datos personales dejaran de ser
                accesibles publicamente.
              </li>
            </ul>

            <hr className="border-surface-elevated" />

            {/* Section 6 */}
            <h2 className="text-2xl font-bold text-text-main">
              6. Tus Derechos
            </h2>

            <p>Como usuario de Bokitas, tenes derecho a:</p>

            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Acceder a tu informacion:</strong> podes ver tus datos
                personales en tu perfil dentro de la aplicacion.
              </li>
              <li>
                <strong>Modificar tu informacion:</strong> podes editar tu
                nombre, nombre de usuario y foto de perfil en cualquier momento.
              </li>
              <li>
                <strong>Eliminar tu cuenta:</strong> podes solicitar la
                eliminacion de tu cuenta desde la seccion de configuracion. Este
                proceso requiere una confirmacion de dos pasos.
              </li>
              <li>
                <strong>Revocar permisos:</strong> podes desactivar el acceso a
                tu ubicacion en cualquier momento desde la configuracion de tu
                dispositivo.
              </li>
            </ul>

            <p>
              Para cualquier solicitud adicional sobre tus datos, contactanos a{" "}
              <strong>support@bokitas.app</strong>.
            </p>

            <hr className="border-surface-elevated" />

            {/* Section 7 */}
            <h2 className="text-2xl font-bold text-text-main">
              7. Privacidad de Menores
            </h2>

            <p>
              Bokitas no esta dirigida a menores de 13 anos. No recopilamos
              intencionalmente informacion de menores de 13 anos. Si sos padre o
              tutor y crees que un menor nos ha proporcionado informacion
              personal, contactanos a <strong>support@bokitas.app</strong> y
              tomaremos las medidas necesarias para eliminar esa informacion.
            </p>

            <hr className="border-surface-elevated" />

            {/* Section 8 */}
            <h2 className="text-2xl font-bold text-text-main">
              8. Cambios a esta Politica
            </h2>

            <p>
              Podemos actualizar esta politica de privacidad periodicamente.
              Cuando realicemos cambios significativos, te notificaremos a traves
              de la aplicacion o por correo electronico. La fecha de
              &quot;ultima actualizacion&quot; al inicio de este documento
              refleja la version mas reciente.
            </p>

            <hr className="border-surface-elevated" />

            {/* Section 9 */}
            <h2 className="text-2xl font-bold text-text-main">9. Contacto</h2>

            <p>
              Si tenes preguntas, dudas o solicitudes sobre esta politica de
              privacidad o el manejo de tus datos personales, podes contactarnos
              en:
            </p>

            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Correo electronico:</strong> support@bokitas.app
              </li>
              <li>
                <strong>Sitio web:</strong>{" "}
                <a
                  href="https://bokitas.app"
                  className="text-primary hover:text-primary-light transition-colors underline"
                >
                  https://bokitas.app
                </a>
              </li>
            </ul>

            <hr className="border-surface-elevated" />

            <p className="text-text-muted text-center italic">
              Bokitas v1.0.0 — Hecho con amor en Costa Rica
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
