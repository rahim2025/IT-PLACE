import { motion } from "framer-motion";
import { business } from "../data/content";
import WhatsAppIcon from "./WhatsAppIcon";

export default function WhatsAppButton() {
  return (
    <motion.a
      href={business.whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with ITPlace on WhatsApp"
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      transition={{ duration: 0.3, delay: 1 }}
      className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/20 cursor-pointer md:bottom-7 md:right-7"
    >
      <WhatsAppIcon className="h-7 w-7" />
      <span className="sr-only">Chat on WhatsApp</span>
    </motion.a>
  );
}
