import { Helmet } from 'react-helmet-async';
import { useLanguage } from '../contexts/LanguageContext';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

export default function PrivacyPolicy() {
  const { t } = useLanguage();
  const content = t('privacyPolicyContent') || [];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white p-4 transition-colors">
      <Helmet>
        <title>{t('privacyPolicyTitle')} – Clipboard Chat</title>
        <meta name="description" content={t('privacyPolicyTitle')} />
      </Helmet>

      <div className="max-w-3xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-6 hover:underline"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          {t('back')}
        </Link>

        <h1 className="text-3xl font-bold mb-6">{t('privacyPolicyTitle')}</h1>
        <div className="prose dark:prose-invert max-w-none space-y-4">
          {content.map((paragraph, idx) => (
            <p key={idx} className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}