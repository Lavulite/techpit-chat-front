import { Container, Form, Button, Row, Col, ListGroup, Navbar } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import './App.scss';
import Channel from './components/Channel';
import Message from './components/Message';

function App() {
  const [isLogin, setIsLogin] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [channels, setChannels] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedChannelId, setSelectedChannelId] = useState(-1);

  const URL = 'http://localhost:8080/spring'

  const handleUsernameChanges = (e) => {
    setUsername(e.target.value)
  }

  const handlePasswordChanges = (e) => {
    setPassword(e.target.value)
  }

  const login = () => {
    fetch(`${URL}/auth/token`, {
      method: 'post',
      headers: new Headers({
        'Authorization': 'Basic ' + btoa(username + ':' + password)
      })
    }).then(res => res.text())
      .then(resToken => {
        setIsLogin(true);
        setToken(resToken);
        findChannel(resToken);
      });
  }

  const findChannel = (token) => {
    fetch(`${URL}/channel`, {
      method: 'get',
      headers: new Headers({
        'Authorization': `Bearer ${token}`
      })
    })
      .then(res => res.json())
      .then(channels => {
        setChannels(channels);
        setSelectedChannelId(channels.map(channel => channel.id).reduce((a, b) => Math.min(a, b)));
      })
  };

  const findMessage = () => {
    fetch(`${URL}/message?channelId=${selectedChannelId}`, {
      method: 'get',
      headers: new Headers({
        'Authorization': `Bearer ${token}`
      })
    })
      .then(res => res.json())
      .then(messages => {
        setMessages(messages);
      })
  }

  useEffect(() => {
    if (selectedChannelId !== -1) {
      findMessage();
    }
  }, [selectedChannelId]);

  return (
    <Container>
      <Navbar bg='dark' variant='dark' fixed='top' className='navbar'>
        <Navbar.Brand>SpringBoot-Advanced-Tutorial Chat App</Navbar.Brand>
      </Navbar>
      {isLogin ? (
        <Row>
          <Col xs={2}>
            <div>チャンネル</div>
            <ListGroup>
              {(channels.map(channel =>
                <Channel channel={channel} selectedChannelId={selectedChannelId} selectChannel={(channelId) => setSelectedChannelId(channelId)} key={channel.id} />))}
            </ListGroup>
          </Col>
          <Col>
            <div>メッセージ</div>
            {(messages.map(message => <Message message={message} key={message.id} />))}
          </Col>
        </Row>
      ) : (
        <div>
          <span>no logined</span>
          <Form>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Label>Username</Form.Label>
              <Form.Control type="text" value={username} onChange={handleUsernameChanges} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" value={password} onChange={handlePasswordChanges} />
            </Form.Group>
          </Form>
          <Button variant="primary" onClick={login}>Login</Button>
        </div>
      )}
    </Container>
  );
}

export default App;
