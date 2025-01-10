// frontend/src/components/WebsiteBlocker.tsx

import React, { useEffect, useState } from 'react';

interface BlockedWebsite {
  id: number; // This should be an integer, but let's ensure it is treated as one
  url: string;
  blockUntil: number;
}

const WebsiteBlocker: React.FC = () => {
  const [website, setWebsite] = useState<string>('');
  const [blockedWebsites, setBlockedWebsites] = useState<BlockedWebsite[]>([]);
  const [timer, setTimer] = useState(0);

  // Load blocked websites from chrome storage when the component mounts
  useEffect(() => {
    chrome.storage.sync.get('blockedWebsites', result => {
      setBlockedWebsites(result.blockedWebsites || []);
    });
  }, []);

  // Add website to block list
  //   const addWebsite = () => {
  //     if (website) {
  //       chrome.storage.sync.get('blockedWebsites', result => {
  //         const newBlockedWebsites = [...(result.blockedWebsites || []), website];
  //         chrome.storage.sync.set({ blockedWebsites: newBlockedWebsites }, () => {
  //           setBlockedWebsites(newBlockedWebsites); // Update state to re-render list
  //           setWebsite(''); // Reset input field
  //         });
  //       });
  //     }
  //   };

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
        blockUntil: timer ? new Date().getTime() + timer * 60 * 1000 : null,
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

  // Remove website from block list
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
      <h3>Website Blocker</h3>
      <label>
        URL:
        <input
          type="text"
          placeholder="https://www.example.com"
          value={website}
          onChange={e => setWebsite(e.target.value)}
          style={{
            padding: '10px',
            marginBottom: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
          }}
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
          style={{
            padding: '10px',
            marginBottom: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
          }}
        />
      </label>
      <br />
      <button
        onClick={addWebsite}
        style={{
          padding: '10px',
          backgroundColor: 'rgb(0, 123, 255)',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
        title="Block"
      >
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
            <button
              onClick={() => removeWebsite(web.url)}
              style={{
                backgroundColor: '#dc3545',
                color: 'white',
                padding: '5px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
              title="Unblock"
            >
              &#9986;
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WebsiteBlocker;
