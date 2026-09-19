import { useTranslation } from 'react-i18next';
import LayeredText from './LayeredText.jsx';

/** A single chant: title, when it's sung, then the three layers. */
export default function ChantCard({ chant }) {
  const { t } = useTranslation('leagues');
  return (
    <article className="card">
      <h3 className="font-display text-lg">{chant.title}</h3>
      {chant.when && <p className="mt-1 text-sm text-subtle">{t('culture.sungWhen', { when: chant.when })}</p>}
      <LayeredText className="mt-4" original={chant.original} literal={chant.literal} meaning={chant.meaning} />
    </article>
  );
}
