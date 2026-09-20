import AppBar from './components/AppBar.jsx'
import TabBar from './components/TabBar.jsx'
import Sidebar from './components/Sidebar.jsx'
import ProgressRail from './components/ProgressRail.jsx'
import CelebrationDrawer from './components/CelebrationDrawer.jsx'
import ChatWidget from './chatbot/ChatWidget.jsx'

import Learn from './pages/Learn.jsx'
import LearnPath from './pages/LearnPath.jsx'
import Field from './pages/Field.jsx'
import Leagues from './pages/Leagues.jsx'
import Culture from './pages/Culture.jsx'
import Quiz from './pages/Quiz.jsx'
import Lesson from './pages/Lesson.jsx'
import Chant from './pages/Chant.jsx'
import Profile from './pages/Profile.jsx'
import Streak from './pages/Streak.jsx'
import Play from './pages/Play.jsx'
import Drills from './pages/Drills.jsx'

import { useRouter } from './router.jsx'

const ROUTES = {
  '/': Learn,
  '/path': LearnPath,
  '/field': Field,
  '/leagues': Leagues,
  '/culture': Culture,
  '/quiz': Quiz,
  '/lesson': Lesson,
  '/chant': Chant,
  '/profile': Profile,
  '/streak': Streak,
  '/play': Play,
  '/drills': Drills,
}

export default function App() {
  const { path } = useRouter()
  const Page = ROUTES[path] ?? Learn

  return (
    <div className="app-shell">
      <AppBar />

      <main className="app-main">
        <div className="app-body">
          <Sidebar />
          <Page />
        </div>
      </main>

      <ProgressRail />

      <TabBar />
      <CelebrationDrawer />
      <ChatWidget />
    </div>
  )
}
