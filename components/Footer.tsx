import type { ReactNode } from "react";
import { MapPin, Phone, Mail } from "lucide-react";

const SITE = "https://kinematicsclasses.com";

const QUICK_LINKS = [
  { label: "Coaching website", href: `${SITE}/` },
  { label: "About", href: `${SITE}/about` },
  { label: "Courses", href: `${SITE}/#courses` },
  { label: "Admission", href: `${SITE}/admission` },
  { label: "Results", href: `${SITE}/results` },
  { label: "Schedule", href: `${SITE}/notifications` },
  { label: "K-SAT", href: `${SITE}/ksat` },
  { label: "Contact", href: `${SITE}/#contact` },
  { label: "Privacy policy", href: `${SITE}/privacy-policy` },
];

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="bg-gray-800 hover:bg-blue-600 p-2 rounded-lg transition-colors"
    >
      {children}
    </a>
  );
}

export default function Footer() {
  return (
    <footer className="bg-linear-to-br from-gray-900 to-gray-800 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <img
                src="/logo.png"
                alt=""
                className="h-12 w-12 rounded-full object-cover"
              />
              <div>
                <h3 className="text-xl font-bold">Kinematics Classes</h3>
                <p className="text-sm text-gray-400">CBT Portal</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Kinematics Classes is a JEE and NEET coaching in Raj Nagar
              Extension, Ghaziabad. We teach Foundation for classes IX and X,
              plus JEE and NEET for XI, XII, and XII pass. ज्ञानम् परम् ध्येयम्
              — knowledge is our supreme goal. This portal is the online test
              platform for our students.
            </p>
            <a
              href={SITE}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex text-sm font-semibold text-blue-400 hover:text-white"
            >
              kinematicsclasses.com
            </a>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Coaching site</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <a
                  href="https://maps.google.com/maps?q=AVS+City+Square+Raj+Nagar+Extension+Ghaziabad"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white"
                >
                  17, 1st Floor, AVS City Square, Raj Nagar Extension,
                  Ghaziabad
                </a>
              </li>
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <span>44, F Block, Raj Nagar Extension, Ghaziabad</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-blue-500 shrink-0" />
                <span className="flex flex-col">
                  <a href="tel:+918527915213" className="hover:text-white">
                    +91 85279 15213
                  </a>
                  <a href="tel:+918882028283" className="hover:text-white">
                    +91 88820 28283
                  </a>
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-blue-500 shrink-0" />
                <a
                  href="mailto:kinematicsclasses24@gmail.com"
                  className="hover:text-white break-all"
                >
                  kinematicsclasses24@gmail.com
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Follow us</h4>
            <p className="text-gray-400 text-sm mb-4">
              Updates from the coaching on Facebook, Instagram, and YouTube.
            </p>
            <div className="flex space-x-3">
              <SocialLink
                href="https://www.facebook.com/kinematicsclasses.page"
                label="Facebook"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
                  <path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h2.6l.4-3H13v-2c0-.6.4-1 1-1z" />
                </svg>
              </SocialLink>
              <SocialLink
                href="https://www.instagram.com/kinematicsclasses.pvt.ltd"
                label="Instagram"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
                  <path d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm5 4.5A4.5 4.5 0 1 0 16.5 12 4.5 4.5 0 0 0 12 7.5zm5.2-.9a1.1 1.1 0 1 0 1.1 1.1 1.1 1.1 0 0 0-1.1-1.1zM12 9.2A2.8 2.8 0 1 1 9.2 12 2.8 2.8 0 0 1 12 9.2z" />
                </svg>
              </SocialLink>
              <SocialLink
                href="https://www.youtube.com/@kinematicsclasses_ds"
                label="YouTube"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
                  <path d="M23 12.2s0-3.2-.4-4.6c-.2-.9-.9-1.6-1.8-1.8C19.2 5.4 12 5.4 12 5.4s-7.2 0-8.8.4c-.9.2-1.6.9-1.8 1.8C1 9 1 12.2 1 12.2s0 3.2.4 4.6c.2.9.9 1.6 1.8 1.8 1.6.4 8.8.4 8.8.4s7.2 0 8.8-.4c.9-.2 1.6-.9 1.8-1.8.4-1.4.4-4.6.4-4.6zM9.8 15.5v-6.6l6.2 3.3-6.2 3.3z" />
                </svg>
              </SocialLink>
              <SocialLink href="https://wa.me/8527915213" label="WhatsApp">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
                  <path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.7-1.2A9 9 0 1 0 12 3zm4.7 12.6c-.2.6-1.2 1.1-1.6 1.1-.4.1-.9.2-2.9-.6-2.4-1-4-3.5-4.1-3.6-.2-.2-1.3-1.7-1.3-3.2s.8-2.3 1.1-2.6.6-.3.8-.3h.6c.2 0 .4 0 .6.5.2.6.8 2 .8 2.1.1.2.1.3 0 .5-.1.2-.2.3-.3.5l-.3.3c-.1.1-.2.3-.1.5.2.3.7 1.2 1.6 1.9 1.1.9 2 1.1 2.3 1.2.2.1.4.1.5-.1l.5-.6c.1-.2.3-.2.5-.1.2.1 1.4.7 1.6.8.2.1.4.2.4.3.1.3 0 .8-.2 1.2z" />
                </svg>
              </SocialLink>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>
            &copy; {new Date().getFullYear()} Kinematics Classes. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
