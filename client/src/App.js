import React, { useEffect, useState, useRef } from 'react';
import { w3cwebsocket as W3CWebSocket } from 'websocket';
import { Card, Avatar, Input, Typography } from 'antd';
import 'antd/dist/antd.css';
import './index.css';

const { Search } = Input;
const { Text } = Typography;
const { Meta } = Card;

const client = new W3CWebSocket('ws://127.0.0.1:8000');

export const App = () => {
  const [userName, setUserName] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [messages, setMessages] = useState([]);
  const [searchValue, setSearchValue] = useState(null);
  const searchRef = useRef(null);

  useEffect(() => {
    client.onopen = () => {
      console.log('WebSocket client connected');
    }
  }, []);

  useEffect(() => {
    client.onmessage = message => {
      const dataFromServer = JSON.parse(message.data);
      console.log('Got a reply!', dataFromServer);
      if (dataFromServer.type === 'message') {
        const newMessages = [...messages, {
          msg: dataFromServer.msg,
          user: dataFromServer.user,
        }];
        setMessages(newMessages);
      }
    }
  }, [messages]);

  const handleOnClick = msg => {
    client.send(JSON.stringify({
      type: 'message',
      msg,
      user: userName,
    }));
    setSearchValue('');
  };

  const handleOnSearch = value => {
    setIsLoggedIn(true);
    setUserName(value);
  }

  const handleOnChange = e => {
    setSearchValue(e.target.value);
  }

  return (
    <main className="main">
      {isLoggedIn ? (
        <div>
          <header className="title">
            <Text type="secondary" style={{ fontSize: '36px' }}>WebSocket Chat</Text>
          </header>

          <div style={{ display: 'flex', flexDirection: 'column', paddingBottom: '20px' }}>
            {messages.map((message, i) => (
              <Card
                key={i}
                style={{ width: 300, margin: '16px 4px 0 4px', alignSelf: userName === message.user ? 'flex-end' : 'flex-start' }}
                loading={false}
              >
                <Meta
                  avatar={<Avatar style={{ color: '#f56a00', backgroundColor: '#fde3cf' }}>{message.user[0].toUpperCase()}</Avatar>}
                  title={message.user}
                  description={message.msg} 
                />
              </Card>
            ))}
          </div>

          <footer className="bottom">
            <Search
              placeholder="Enter message"
              enterButton="Send"
              size="large"
              onSearch={handleOnClick}
              onChange={handleOnChange}
              ref={searchRef}
              value={searchValue}
            />
          </footer>
        </div>
      ) : (
        <div style={{ padding: '200px 40px' }}>
          <Search
            placeholder="Enter username"
            enterButton="Login"
            size="large"
            onSearch={handleOnSearch}
          />
        </div>
      )}
      
    </main>
  )
}