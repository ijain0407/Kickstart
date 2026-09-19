import { useTranslation } from 'react-i18next';
import Dialog from '../../../components/Dialog.jsx';
import Icon from '../../../components/Icon.jsx';
import LevelBadge from './LevelBadge.jsx';

export default function LevelUpOverlay({ level, onClose }) {
  const { t } = useTranslation('quiz');
  return (
    <Dialog titleId="levelup-title" onClose={onClose} className="text-center">
      <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-amber-900 motion-safe:animate-pop">
        <Icon name="star" className="h-10 w-10" />
      </div>
      <h2 id="levelup-title" className="text-3xl">{t('results.levelUp')}</h2>
      <p className="mt-2">{t('results.levelUpBody', { level: t(`level.${level}`, { ns: 'common' }) })}</p>
      <LevelBadge level={level} className="mt-3 text-base" />
      <div className="mt-6">
        <button type="button" className="btn-primary" onClick={onClose}>
          {t('results.continue')}
        </button>
      </div>
    </Dialog>
  );
}
