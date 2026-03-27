import Sidebar from './components/Sidebar/Sidebar';
import MainContent from './components/MainContent/MainContent';
import Table from './components/Table/Table';

import './App.css';
import { useState } from 'react';

function App() {
  const [selectedTab, setSelectedTab] = useState("stocks");

  return (
    <>
      <Sidebar selectedTab={selectedTab} />

      <MainContent>
        <Table>

        </Table>
      </MainContent>
    </>
  )
}

export default App
