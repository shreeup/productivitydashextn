import React, { useEffect, useState } from 'react';

interface BlockedWebsite {
  id: number;
  url: string;
  blockUntil: number; // timestamp when the website will be unblocked
}

const WebsiteBlocker: React.FC = () => {
  const [website, setWebsite] = useState<string>('');
  const [blockedWebsites, setBlockedWebsites] = useState<BlockedWebsite[]>([]);
  const [timer, setTimer] = useState<number>(1); // Time in minutes

  // Load blocked websites from chrome storage when the component mounts
  useEffect(() => {
    chrome.storage.sync.get('blockedWebsites', result => {
      setBlockedWebsites(result.blockedWebsites || []);
    });
  }, []);

  const addWebsite = () => {
    if (!website || !/^https?:\/\/[\w.-]+$/.test(website)) {
      alert('Please enter a valid URL.');
      return;
    }

    chrome.storage.sync.get('blockedWebsites', result => {
      const blocked = result.blockedWebsites || [];
      if (blocked.find((web: { url: string }) => web.url === website)) {
        alert('This website is already blocked.');
        return;
      }

      const newBlockedWebsite = {
        url: website,
        blockUntil: timer
          ? new Date().getTime() + timer * 60 * 1000
          : Date.now(), // block until the time is reached
      };
      const updatedBlockedWebsites = [...blocked, newBlockedWebsite];
      chrome.storage.sync.set(
        { blockedWebsites: updatedBlockedWebsites },
        () => {
          setBlockedWebsites(updatedBlockedWebsites);
          setWebsite('');
          setTimer(0);
        }
      );
    });
  };

  const removeWebsite = (websiteToRemove: string) => {
    chrome.storage.sync.get('blockedWebsites', result => {
      const updatedWebsites = result.blockedWebsites.filter(
        (web: BlockedWebsite) => web.url !== websiteToRemove
      );
      chrome.storage.sync.set({ blockedWebsites: updatedWebsites }, () => {
        setBlockedWebsites(updatedWebsites); // Update state to re-render list
      });
    });
  };

  return (
    <div>
      <label>
        URL:
        <input
          type="text"
          placeholder="https://www.example.com"
          value={website}
          onChange={e => setWebsite(e.target.value)}
        />
      </label>
      <br />
      <label>
        Block for (min):
        <input
          type="number"
          placeholder="Block for (min)"
          value={timer}
          onChange={e => setTimer(Number(e.target.value))}
        />
      </label>
      <br />
      <button onClick={addWebsite} title="Block">
        Block
      </button>
      <h5 style={{ marginTop: '20px' }}>Blocked Websites</h5>
      <ul>
        {blockedWebsites.map((web, index) => (
          <li
            key={index}
            style={{
              margin: '5px 0',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            {web.url} {'blocked till '} {new Date(web.blockUntil).toString()}{' '}
            <button onClick={() => removeWebsite(web.url)} title="Unblock">
              &#9986;
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WebsiteBlocker;
