import { useState } from 'react'
import Icon from '../components/Icon.jsx'
import FieldPressButton from '../components/FieldPressButton.jsx'
import DataState from '../components/DataState.jsx'
import { api, useResource } from '../lib/api.js'
import { useAuth } from '../state/AuthState.jsx'
import { useApp } from '../state/AppState.jsx'
import { useI18n } from '../i18n/I18nContext.jsx'
import { useRouter } from '../router.jsx'

/** Maps the API's error codes onto something a person can act on. */
function messageFor(error, t) {
  switch (error?.code) {
    case 'INVALID_CREDENTIALS':
      return t('account.errors.credentials')
    case 'EMAIL_TAKEN':
      return t('account.errors.taken')
    case 'VALIDATION_ERROR':
      return t('account.errors.validation')
    case 'DB_UNAVAILABLE':
      return t('account.errors.unavailable')
    default:
      return error?.message || t('common.loadError')
  }
}

function SignInForm() {
  const { t } = useI18n()
  const { login, register } = useAuth()
  const [mode, setMode] = useState('signIn')
  const [form, setForm] = useState({ email: '', password: '', displayName: '' })
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const creating = mode === 'register'
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      if (creating) await register(form)
      else await login({ email: form.email, password: form.password })
    } catch (err) {
      setError(err)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="card card--pad-lg stack stack-4" onSubmit={submit}>
      <div className="stack stack-2">
        <h2 className="t-headline-md">{creating ? t('account.createTitle') : t('account.signInTitle')}</h2>
        <p className="t-body-md text-secondary">{t('account.progressNote')}</p>
      </div>

      {creating ? (
        <label className="stack stack-1">
          <span className="t-label-meta text-secondary">{t('account.displayName')}</span>
          <input
            className="field"
            type="text"
            required
            maxLength={60}
            autoComplete="nickname"
            value={form.displayName}
            onChange={set('displayName')}
          />
        </label>
      ) : null}

      <label className="stack stack-1">
        <span className="t-label-meta text-secondary">{t('account.email')}</span>
        <input className="field" type="email" required autoComplete="email" value={form.email} onChange={set('email')} />
      </label>

      <label className="stack stack-1">
        <span className="t-label-meta text-secondary">{t('account.password')}</span>
        <input
          className="field"
          type="password"
          required
          minLength={8}
          autoComplete={creating ? 'new-password' : 'current-password'}
          value={form.password}
          onChange={set('password')}
        />
        {creating ? <span className="t-body-sm text-secondary">{t('account.passwordHint')}</span> : null}
      </label>

      {error ? (
        <p className="explain explain--bad" role="alert">
          <Icon name="info" fill /> {messageFor(error, t)}
        </p>
      ) : null}

      <FieldPressButton variant="primary" block type="submit" disabled={busy} iconAfter="arrow_forward">
        {creating ? t('account.createCta') : t('account.signInCta')}
      </FieldPressButton>

      <button type="button" className="fp fp--tertiary" onClick={() => { setMode(creating ? 'signIn' : 'register'); setError(null) }}>
        {creating ? t('account.haveAccount') : t('account.needAccount')}
      </button>
    </form>
  )
}

function Profile() {
  const { t, tr, lang } = useI18n()
  const { navigate } = useRouter()
  const { user, logout, updateProfile } = useAuth()
  const { xp, level, streak, chantsMastered, stats } = useApp()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const clubs = useResource((signal) => api('/culture', { lang, signal }), [lang])

  const pickClub = async (cultureId) => {
    setSaving(true)
    setError(null)
    try {
      const card = clubs.data?.cards.find((c) => c.id === cultureId)
      await updateProfile({ favouriteClubId: cultureId || null, favouriteLeagueId: card?.leagueId ?? null })
    } catch (err) {
      setError(err)
    } finally {
      setSaving(false)
    }
  }

  const favourite = clubs.data?.cards.find((c) => c.id === user.favouriteClubId) ?? null

  return (
    <div className="stack stack-4">
      <section className="card card--pad-lg stack stack-3">
        <div className="row row-3">
          <span className="tile tile--greensolid tile--circle">
            <Icon name="person" fill />
          </span>
          <div className="grow stack stack-1">
            <h2 className="t-headline-md">{user.displayName}</h2>
            <p className="t-body-sm text-secondary">{user.email}</p>
          </div>
        </div>

        {/* What the account is actually carrying, so it's obvious sign-in did something. */}
        <div className="row row-2 wrap">
          <span className="pill pill--gold">{`${xp} ${t('common.xp')}`}</span>
          <span className="pill pill--grey">{`${t('account.level')} ${level}`}</span>
          <span className="pill pill--grey">{`${streak} ${t('streak.dayUnit')}`}</span>
          <span className="pill pill--grey">{`${chantsMastered} ${t('account.chants')}`}</span>
          {stats?.lessonsCompleted ? (
            <span className="pill pill--grey">{`${stats.lessonsCompleted} ${t('account.lessons')}`}</span>
          ) : null}
        </div>
        <p className="t-body-sm text-secondary">{t('account.syncNote')}</p>
      </section>

      <section className="card card--pad stack stack-3">
        <h3 className="t-headline-sm">{t('account.favouriteClub')}</h3>

        <DataState loading={clubs.loading} error={clubs.error} onRetry={clubs.reload} rows={1}>
          <label className="stack stack-1">
            <span className="sr-only">{t('account.favouriteClub')}</span>
            <select
              className="field"
              value={user.favouriteClubId ?? ''}
              disabled={saving}
              onChange={(e) => pickClub(e.target.value)}
            >
              <option value="">{t('account.noClub')}</option>
              {(clubs.data?.cards ?? []).map((card) => (
                <option key={card.id} value={card.id}>
                  {tr(card.club)}
                </option>
              ))}
            </select>
          </label>
        </DataState>

        {favourite ? (
          <button type="button" className="fp fp--tertiary" onClick={() => navigate(`/culture?league=${favourite.leagueId}&club=${favourite.id}`)}>
            {t('account.visitClub')} <Icon name="arrow_forward" />
          </button>
        ) : null}

        {error ? (
          <p className="explain explain--bad" role="alert">
            <Icon name="info" fill /> {messageFor(error, t)}
          </p>
        ) : null}
      </section>

      <FieldPressButton variant="soft" block icon="logout" onClick={logout}>
        {t('account.signOut')}
      </FieldPressButton>
    </div>
  )
}

export default function Account() {
  const { t } = useI18n()
  const { user, accounts, loading } = useAuth()

  return (
    <div className="page">
      <div className="stack stack-2">
        <h1 className="t-headline-lg">{t('account.title')}</h1>
        <p className="t-body-md text-secondary">{t('account.sub')}</p>
      </div>

      {loading ? (
        <DataState loading rows={2}>
          {null}
        </DataState>
      ) : !accounts ? (
        <section className="card card--pad-lg stack stack-2" role="status">
          <h2 className="t-headline-sm">{t('account.errors.unavailable')}</h2>
          <p className="t-body-md text-secondary">{t('account.offlineNote')}</p>
        </section>
      ) : user ? (
        <Profile />
      ) : (
        <SignInForm />
      )}
    </div>
  )
}
