import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';

export default function FAQSection() {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqItems = t('faqItems') || [];

  return (
    <section className="w-full max-w-3xl mx-auto mt-12 px-4">
      <h2 className="text-2xl font-bold mb-6 text-center text-black dark:text-white">
        {t('faqTitle')}
      </h2>
      <div className="space-y-3">
        {faqItems.map((item, index) => (
          <div
            key={index}
            className="bg-gray-100 dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden transition-all"
          >
            <button
              onClick={() => toggle(index)}
              className="w-full flex items-center justify-between px-5 py-4 text-left font-semibold text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-expanded={openIndex === index}
            >
              <span>{item.question}</span>
              <FontAwesomeIcon
                icon={openIndex === index ? faChevronUp : faChevronDown}
                className="text-gray-500 dark:text-gray-400 transition-transform"
              />
            </button>
            {openIndex === index && (
              <div className="px-5 pb-4 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {item.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}