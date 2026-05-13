import { useEffect, useState } from 'react';
import Sidebar from './ui/components/Sidebar/Sidebar';
import { Outlet, useParams } from 'react-router';
import PageNotFound from './ui/pages/PageNotFound/PageNotFound';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function App() {
  const [error, setError] = useState(false);

  const { userUUID } = useParams();

  if (!userUUID || !UUID_REGEX.test(userUUID)) {
    return <PageNotFound />;
  }

  useEffect(() => {
    const UUID = localStorage.getItem("userUUID");

    if (!UUID) setError(true);
  }, [])

  return (
    <>
      {!error ? 
        <>
          <Sidebar />

          <main>
            <Outlet />
          </main>
        </>
        :
        <p className="error">ERROR</p>
      }
    </>
  )
}

export default App
