import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar/Navbar";
import { Footer } from "@/components/Footer/Footer";

export const metadata: Metadata = {
  title: "Terminos de Servicio - Bokitas",
  description:
    "Terminos de Servicio de Bokitas. Conoce las condiciones de uso de nuestra plataforma.",
};

export default function ServicePage() {
  return (
    <main id="main" className="min-h-screen">
      <Navbar />
      <section className="pt-32 pb-20 px-4 md:px-6">
        <div className="container mx-auto max-w-3xl prose prose-invert prose-headings:text-text-main prose-p:text-text-secondary prose-li:text-text-secondary prose-strong:text-text-main prose-a:text-primary hover:prose-a:text-primary-light">
          <h1>Terminos de Servicio de Bokitas</h1>

          <p>
            <strong>Ultima actualizacion:</strong> 17 de febrero de 2026
          </p>

          <p>
            Bienvenido a <strong>Bokitas</strong> (&quot;la Aplicacion&quot;, &quot;el
            Servicio&quot;, &quot;nosotros&quot;). Bokitas es una plataforma movil gratuita
            para descubrir, calificar y compartir experiencias en restaurantes de
            Costa Rica. Al crear una cuenta o utilizar la Aplicacion, aceptas
            estos Terminos de Servicio (&quot;Terminos&quot;). Si no estas de acuerdo, no
            utilices el Servicio.
          </p>

          <hr />

          <h2>1. Descripcion del Servicio</h2>

          <p>
            Bokitas es una aplicacion movil gratuita que permite a los usuarios:
          </p>

          <ul>
            <li>
              Descubrir restaurantes en Costa Rica mediante busqueda, filtros y
              mapas.
            </li>
            <li>
              Crear resenas escritas con calificaciones (1-5) y fotografias de
              restaurantes.
            </li>
            <li>
              Guardar restaurantes en una lista personal (&quot;Eatlist&quot;) con estados
              &quot;Quiero Visitar&quot; y &quot;Visitado&quot;.
            </li>
            <li>
              Destacar sus 4 restaurantes favoritos en su perfil.
            </li>
            <li>
              Crear y gestionar un perfil personal con foto, biografia y
              provincia.
            </li>
          </ul>

          <p>
            Bokitas <strong>no</strong> es un servicio de reservaciones, delivery,
            ni comercio electronico. No vendemos productos ni servicios de
            restaurantes, y no intermediamos transacciones comerciales entre
            usuarios y establecimientos.
          </p>

          <hr />

          <h2>2. Elegibilidad y Registro</h2>

          <h3>2.1 Edad minima</h3>
          <p>
            Debes tener al menos <strong>13 anos de edad</strong> para crear una
            cuenta y utilizar Bokitas. Si eres menor de 18 anos, declaras que
            cuentas con el consentimiento de tu padre, madre o tutor legal.
          </p>

          <h3>2.2 Informacion de registro</h3>
          <p>
            Al registrarte proporcionaras: nombre, apellidos, correo electronico
            y contrasena. Opcionalmente podras agregar numero de telefono,
            provincia, bio y foto de perfil. Te comprometes a:
          </p>

          <ul>
            <li>Proporcionar informacion veraz y actualizada.</li>
            <li>Mantener la confidencialidad de tu contrasena.</li>
            <li>
              Notificarnos de inmediato cualquier uso no autorizado de tu cuenta
              a <strong>support@bokitas.app</strong>.
            </li>
          </ul>

          <h3>2.3 Una cuenta por persona</h3>
          <p>
            Cada persona podra tener una unica cuenta. Nos reservamos el derecho
            de suspender o eliminar cuentas duplicadas.
          </p>

          <hr />

          <h2>3. Uso Aceptable</h2>

          <p>Al utilizar Bokitas, te comprometes a:</p>

          <ul>
            <li>
              Usar la Aplicacion unicamente para los fines previstos: descubrir
              restaurantes y compartir experiencias gastronomicas genuinas.
            </li>
            <li>
              No publicar contenido falso, difamatorio, ofensivo,
              discriminatorio, obsceno o que incite a la violencia.
            </li>
            <li>
              No suplantar la identidad de otra persona o entidad.
            </li>
            <li>
              No publicar resenas falsas, manipuladas o pagadas.
            </li>
            <li>
              No utilizar la Aplicacion para fines comerciales, publicitarios o
              de spam sin autorizacion previa.
            </li>
            <li>
              No intentar acceder de forma no autorizada a la Aplicacion, sus
              servidores o las cuentas de otros usuarios.
            </li>
            <li>
              No utilizar bots, scrapers u otras herramientas automatizadas para
              extraer datos de la Aplicacion.
            </li>
            <li>
              No interferir con el funcionamiento normal de la Aplicacion ni con
              la experiencia de otros usuarios.
            </li>
            <li>
              Respetar los derechos de propiedad intelectual de terceros al subir
              contenido.
            </li>
          </ul>

          <p>
            Nos reservamos el derecho de eliminar contenido y suspender o
            cancelar cuentas que violen estas reglas, a nuestra discrecion y sin
            previo aviso.
          </p>

          <hr />

          <h2>4. Contenido del Usuario</h2>

          <h3>4.1 Tu contenido</h3>
          <p>
            &quot;Contenido del Usuario&quot; incluye resenas, calificaciones,
            fotografias, textos de perfil y cualquier otro material que publiques
            en Bokitas.
          </p>

          <h3>4.2 Propiedad</h3>
          <p>
            Conservas la propiedad de tu Contenido del Usuario. Sin embargo, al
            publicarlo en Bokitas, nos otorgas una{" "}
            <strong>
              licencia mundial, no exclusiva, libre de regalias, sublicenciable y
              transferible
            </strong>{" "}
            para usar, reproducir, modificar, mostrar y distribuir dicho
            contenido en relacion con la operacion y promocion del Servicio.
          </p>

          <h3>4.3 Uso comunitario del contenido</h3>
          <p>
            Las resenas y calificaciones que publiques contribuyen a la
            calificacion promedio de los restaurantes visible para toda la
            comunidad. La primera fotografia de resena de un restaurante podra
            ser utilizada como imagen de portada de dicho restaurante en la
            Aplicacion.
          </p>

          <h3>4.4 Responsabilidad sobre el contenido</h3>
          <p>
            Eres el unico responsable del contenido que publicas. No
            garantizamos la exactitud, calidad ni fiabilidad de ningun Contenido
            del Usuario. Las opiniones expresadas en las resenas son de sus
            autores y no representan la posicion de Bokitas.
          </p>

          <h3>4.5 Eliminacion de contenido</h3>
          <p>
            Nos reservamos el derecho de eliminar cualquier contenido que, a
            nuestro criterio, viole estos Terminos o resulte inapropiado, sin
            obligacion de notificarte previamente.
          </p>

          <hr />

          <h2>5. Informacion de Restaurantes</h2>

          <p>
            La informacion sobre restaurantes (nombres, ubicaciones, categorias y
            otros datos) se obtiene a traves de{" "}
            <strong>servicios de terceros</strong> (Foursquare Places API).
            Bokitas no garantiza la exactitud, vigencia ni integridad de esta
            informacion. Los horarios, precios, disponibilidad y demas datos
            operativos de los restaurantes pueden variar sin que esto sea
            responsabilidad de Bokitas.
          </p>

          <hr />

          <h2>6. Propiedad Intelectual</h2>

          <h3>6.1 Nuestra propiedad</h3>
          <p>
            La Aplicacion, su diseno, codigo fuente, logotipos, marca
            &quot;Bokitas&quot; y todo el material original son propiedad de Bokitas y
            estan protegidos por las leyes de propiedad intelectual de Costa Rica
            y tratados internacionales aplicables.
          </p>

          <h3>6.2 Restricciones</h3>
          <p>
            No podras copiar, modificar, distribuir, vender ni crear obras
            derivadas de la Aplicacion o su contenido original sin autorizacion
            expresa por escrito.
          </p>

          <hr />

          <h2>7. Privacidad y Datos Personales</h2>

          <p>
            El tratamiento de tus datos personales se rige por nuestra{" "}
            <a href="https://bokitas.app/privacy">Politica de Privacidad</a>,
            que forma parte integral de estos Terminos. Al aceptar estos
            Terminos, aceptas tambien nuestra Politica de Privacidad.
          </p>

          <h3>7.1 Permisos del dispositivo</h3>
          <p>La Aplicacion podra solicitar acceso a:</p>

          <ul>
            <li>
              <strong>Ubicacion:</strong> para mostrar restaurantes cercanos a tu
              posicion.
            </li>
            <li>
              <strong>Camara y galeria de fotos:</strong> para subir fotografias
              a resenas y perfil.
            </li>
            <li>
              <strong>Notificaciones push</strong> (futuro): para enviarte
              actualizaciones relevantes.
            </li>
          </ul>

          <p>
            Estos permisos son opcionales y puedes revocarlos en cualquier
            momento desde la configuracion de tu dispositivo, aunque esto podra
            limitar ciertas funcionalidades.
          </p>

          <hr />

          <h2>8. Cuenta: Suspension y Eliminacion</h2>

          <h3>8.1 Suspension o cancelacion por nuestra parte</h3>
          <p>
            Podemos suspender o cancelar tu cuenta temporal o permanentemente si:
          </p>

          <ul>
            <li>Violas estos Terminos.</li>
            <li>Publicas contenido inapropiado de forma reiterada.</li>
            <li>
              Realizas actividades que danena o ponen en riesgo el Servicio o a
              otros usuarios.
            </li>
            <li>
              Lo exige una orden judicial o requerimiento de autoridad
              competente.
            </li>
          </ul>

          <h3>8.2 Eliminacion por tu parte</h3>
          <p>
            Podes eliminar tu cuenta en cualquier momento desde la seccion de
            Configuracion de la Aplicacion. Al eliminar tu cuenta:
          </p>

          <ul>
            <li>
              Tu perfil dejara de ser visible para otros usuarios.
            </li>
            <li>
              Tus resenas y calificaciones podran permanecer en la plataforma de
              forma anonimizada para mantener la integridad de las calificaciones
              de restaurantes.
            </li>
            <li>
              La eliminacion es un proceso de{" "}
              <strong>desactivacion</strong> (eliminacion logica). Si deseas la
              eliminacion completa de tus datos, podes solicitarlo escribiendo a{" "}
              <strong>support@bokitas.app</strong>.
            </li>
          </ul>

          <hr />

          <h2>9. Disponibilidad del Servicio</h2>

          <p>
            Bokitas se proporciona &quot;tal cual&quot; y &quot;segun disponibilidad&quot;. No
            garantizamos que el Servicio estara disponible de forma
            ininterrumpida, libre de errores ni seguro en todo momento. Nos
            reservamos el derecho de:
          </p>

          <ul>
            <li>
              Modificar, suspender o descontinuar el Servicio (o cualquier parte
              del mismo) en cualquier momento.
            </li>
            <li>
              Realizar mantenimientos programados o de emergencia sin previo
              aviso.
            </li>
          </ul>

          <hr />

          <h2>10. Limitacion de Responsabilidad</h2>

          <p>
            En la maxima medida permitida por la legislacion costarricense:
          </p>

          <ul>
            <li>
              Bokitas <strong>no sera responsable</strong> por danos directos,
              indirectos, incidentales, especiales o consecuentes derivados del
              uso o imposibilidad de uso del Servicio.
            </li>
            <li>
              No somos responsables por la informacion proporcionada por terceros
              (datos de restaurantes, mapas, etc.).
            </li>
            <li>
              No somos responsables por el contenido publicado por los usuarios.
            </li>
            <li>
              No somos responsables por la perdida de datos derivada de fallas
              tecnicas, incluyendo pero no limitado a interrupciones del servicio
              de alojamiento o de terceros proveedores.
            </li>
            <li>
              No garantizamos que los restaurantes descubiertos a traves de la
              Aplicacion cumplan con tus expectativas de calidad, higiene o
              servicio.
            </li>
          </ul>

          <hr />

          <h2>11. Indemnizacion</h2>

          <p>
            Aceptas indemnizar y mantener indemne a Bokitas, su creador,
            colaboradores y proveedores de servicio ante cualquier reclamo,
            demanda, dano, costo o gasto (incluyendo honorarios de abogados) que
            surja de:
          </p>

          <ul>
            <li>Tu uso del Servicio.</li>
            <li>Tu incumplimiento de estos Terminos.</li>
            <li>Tu contenido publicado en la Aplicacion.</li>
            <li>Tu violacion de derechos de terceros.</li>
          </ul>

          <hr />

          <h2>12. Servicios de Terceros</h2>

          <p>
            Bokitas utiliza servicios de terceros para su funcionamiento,
            incluyendo pero no limitado a:
          </p>

          <ul>
            <li>
              <strong>Supabase</strong> (autenticacion, base de datos y
              almacenamiento).
            </li>
            <li>
              <strong>Foursquare Places API</strong> (informacion de
              restaurantes).
            </li>
            <li>
              <strong>Google Maps</strong> (visualizacion de mapas).
            </li>
            <li>
              <strong>Expo / React Native</strong> (infraestructura de la
              aplicacion).
            </li>
          </ul>

          <p>
            El uso de estos servicios de terceros esta sujeto a sus propios
            terminos y politicas de privacidad. Bokitas no es responsable por el
            funcionamiento, disponibilidad ni politicas de estos servicios.
          </p>

          <hr />

          <h2>13. Gratuidad del Servicio</h2>

          <p>
            Bokitas es un servicio <strong>gratuito</strong>. No cobramos por
            descargar la aplicacion, crear una cuenta ni utilizar sus
            funcionalidades. Nos reservamos el derecho de introducir
            funcionalidades premium o de pago en el futuro, las cuales seran
            debidamente comunicadas y requeriran tu consentimiento expreso.
          </p>

          <hr />

          <h2>14. Modificaciones a los Terminos</h2>

          <p>
            Podemos modificar estos Terminos en cualquier momento. Cuando
            realicemos cambios sustanciales:
          </p>

          <ul>
            <li>
              Publicaremos los Terminos actualizados en la Aplicacion y en{" "}
              <a href="https://bokitas.app/terms">bokitas.app/terms</a>.
            </li>
            <li>
              Actualizaremos la fecha de &quot;Ultima actualizacion&quot; al inicio de este
              documento.
            </li>
            <li>
              Podremos notificarte a traves de la Aplicacion o por correo
              electronico.
            </li>
          </ul>

          <p>
            El uso continuado del Servicio despues de la publicacion de los
            cambios constituye tu aceptacion de los nuevos Terminos.
          </p>

          <hr />

          <h2>15. Legislacion Aplicable y Jurisdiccion</h2>

          <p>
            Estos Terminos se rigen por las leyes de la{" "}
            <strong>Republica de Costa Rica</strong>. Cualquier controversia
            derivada de estos Terminos o del uso del Servicio sera sometida a la
            jurisdiccion de los tribunales competentes de Costa Rica.
          </p>

          <hr />

          <h2>16. Disposiciones Generales</h2>

          <ul>
            <li>
              <strong>Acuerdo completo:</strong> Estos Terminos, junto con la
              Politica de Privacidad, constituyen el acuerdo completo entre vos y
              Bokitas.
            </li>
            <li>
              <strong>Divisibilidad:</strong> Si alguna disposicion de estos
              Terminos es declarada invalida o inaplicable, las demas
              disposiciones permaneceran en pleno vigor.
            </li>
            <li>
              <strong>Renuncia:</strong> La falta de ejercicio de un derecho bajo
              estos Terminos no constituye una renuncia al mismo.
            </li>
            <li>
              <strong>Cesion:</strong> No podras ceder ni transferir tus derechos
              u obligaciones bajo estos Terminos sin nuestro consentimiento
              previo por escrito.
            </li>
          </ul>

          <hr />

          <h2>17. Contacto</h2>

          <p>
            Si tenes preguntas, comentarios o inquietudes sobre estos Terminos de
            Servicio, podes contactarnos en:
          </p>

          <ul>
            <li>
              <strong>Correo electronico:</strong> support@bokitas.app
            </li>
            <li>
              <strong>Sitio web:</strong>{" "}
              <a href="https://bokitas.app">bokitas.app</a>
            </li>
          </ul>

          <hr />

          <p>
            <em>Bokitas -- Hecho con amor en Costa Rica.</em>
          </p>
        </div>
      </section>
      <Footer />
    </main>
  );
}
