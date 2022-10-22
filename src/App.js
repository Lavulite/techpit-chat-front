import { Container, Form, Button, Row, Col, ListGroup, Navbar, InputGroup, FormControl, Alert, Modal } from 'react-bootstrap';
import React, { useCallback, useEffect, useReducer } from 'react';
import './App.scss';
import Channel from './components/Channel';
import Message from './components/Message';

const initialState = {
  url: 'http://localhost:8080/chat-backend',
  isLogin: false,
  username: "",
  passowrd: "",
  infoMessage: "",
  errorMessage: "",
  token: "",
  channels: [],
  messages: [],
  typedMessage: "",
  selectedChannelId: -1,
  showAddChannelModal: false,
  channelName: "",
  searchWord: ""
}

const reducer = (state, action) => {
  switch (action.type) {
    case "URL_CHANGE":
      return {
        ...state,
        url: action.url
      };
    case "USERNAME_CHANGE":
      return {
        ...state,
        username: action.username
      };
    case "PASSWORD_CHANGE":
      return {
        ...state,
        password: action.password
      };
    case "SIGNUP_SUCCESS":
      return {
        ...state,
        infoMessage: "ユーザー追加完了しました。追加したユーザでログインしてください。",
        errorMessage: ""
      };
    case "SIGNUP_FAILURE":
      return {
        ...state,
        infoMessage: "",
        errorMessage: "入力されたユーザー名はすでに使用されています。"
      };
    case "LOGIN_SUCCESS":
      return {
        ...state,
        isLogin: true,
        password: "",
        infoMessage: "",
        errorMessage: "",
        token: action.token
      };
    case "LOGIN_FAILURE":
      return {
        ...state,
        isLogin: false,
        infoMessage: "",
        errorMessage: "ユーザー名またはパスワードが間違っています。",
        password: ""
      };
    case "LOGIN_SKIP":
      return {
        ...state,
        isLogin: true
      }
    case "LOGOUT":
      return {
        ...initialState
      };
    case "LOGIN_EXPIRED":
      return {
        ...initialState,
        errorMessage: "認証セッションが切れました。再度ログインしてください。"
      };
    case "UPDATE_CHANNEL":
      return {
        ...state,
        channels: action.channels,
        selectedChannelId: action.selectedChannelId
      }
    case "UPDATE_MESSAGES":
      return {
        ...state,
        messages: action.messages
      };
    case "TYPED_MESSAGE_CHANGE":
      return {
        ...state,
        typedMessage: action.typedMessage
      };
    case "POST_SUCCESS":
      return {
        ...state,
        typedMessage: ""
      };
    case "SELECT_CHANNED_ID":
      return {
        ...state,
        selectedChannelId: action.selectedChannelId,
        searchWord: ''
      };
    case "OPEN_ADD_CHANNEL_MODAL":
      return {
        ...state,
        showAddChannelModal: true
      };
    case "CLOSE_ADD_CHANNEL_MODAL":
      return {
        ...state,
        channelName: "",
        showAddChannelModal: false
      };
    case "CHANNEL_NAME_CHANGE":
      return {
        ...state,
        channelName: action.channelName
      };
    case "SEARCH_WORD_CHANGE":
      return {
        ...state,
        searchWord: action.searchWord
      };
    default:
      return state;
  }
}

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { url, isLogin, username, password, infoMessage, errorMessage, token, channels, messages, typedMessage, selectedChannelId, showAddChannelModal, channelName, searchWord } = state;

  const messagesContainer = React.createRef();


  const handleUrlChanges = (e) => {
    dispatch({
      type: "URL_CHANGE",
      url: e.target.value
    });
  }

  const handleUsernameChanges = (e) => {
    dispatch({
      type: "USERNAME_CHANGE",
      username: e.target.value
    });
  }

  const handlePasswordChanges = (e) => {
    dispatch({
      type: "PASSWORD_CHANGE",
      password: e.target.value
    });
  }

  const handleTypedMessageChanges = (e) => {
    dispatch({
      type: "TYPED_MESSAGE_CHANGE",
      typedMessage: e.target.value
    });
  }

  const login = () => {
    fetch(`${url}/auth/token`, {
      method: 'post',
      headers: new Headers({
        'Authorization': 'Basic ' + btoa(username + ':' + password)
      })
    }).then(res => {
      if (res.status === 200) {
        res.text().then(
          resToken => {
            dispatch({
              type: "LOGIN_SUCCESS",
              token: resToken
            })
          }
        )
      } else {
        dispatch({
          type: "LOGIN_FAILURE"
        });
      }
    });
  }

  const loginSkip = () => {
    dispatch({
      type: "LOGIN_SKIP"
    })
  }

  const signup = () => {
    const user = {
      username: username,
      password: password
    };

    fetch(`${url}/auth/signup`, {
      method: 'post',
      headers: new Headers({
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify(user)
    }).then(res => {
      if (res.status === 200) {
        dispatch({
          type: "SIGNUP_SUCCESS"
        })
      } else {
        dispatch({
          type: "SIGNUP_FAILUER"
        })
      }
    })
  }

  const logout = () => {
    dispatch({
      type: "LOGOUT"
    })
  }

  const findChannel = useCallback(token => {
    fetch(`${url}/channels`, {
      method: 'get',
      headers: new Headers({
        'Authorization': `Bearer ${token}`
      })
    })
      .then(res => {
        if (res.status === 200) {
          res.json()
            .then(channels => {
              dispatch({
                type: "UPDATE_CHANNEL",
                channels: channels,
                selectedChannelId: channels.map(channel => channel.id).reduce((a, b) => Math.min(a, b))
              });
            });
        } else {
          dispatch({
            type: "LOGIN_EXPIRED"
          });
        }
      })
  }, [url]);


  useEffect(() => {
    if (isLogin) {
      findChannel(token)
    }
  }, [isLogin, token, findChannel])

  const setSelectedChannelId = channelId => {
    dispatch({
      type: "SELECT_CHANNED_ID",
      selectedChannelId: channelId
    })
  }

  const findMessage = useCallback((channelId, searchWord) => {
    const wordCondition = searchWord ? `&searchWord=${searchWord}` : '';
    fetch(`${url}/messages?channelId=${channelId}${wordCondition}`, {
      method: 'get',
      headers: new Headers({
        'Authorization': `Bearer ${token}`
      })
    })
      .then(res => {
        if (res.status === 200) {
          res.json().then(
            messages => {
              dispatch({
                type: "UPDATE_MESSAGES",
                messages: messages
              })
            }
          )
        } else {
          dispatch({
            type: "LOGIN_EXPIRED"
          })
        }
      })
  }, [token, url]);

  useEffect(() => {
    if (selectedChannelId !== -1) {
      findMessage(selectedChannelId, '');
    }
  }, [selectedChannelId, findMessage]);

  const postMessage = useCallback(() => {
    const body = {
      channelId: selectedChannelId,
      text: typedMessage
    };

    fetch(`${url}/messages`, {
      method: 'post',
      headers: new Headers({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify(body)
    })
      .then(res => {
        if (res.status === 200) {
          dispatch({
            type: "POST_SUCCESS"
          })
          findMessage(selectedChannelId, '')
        } else {
          dispatch({
            type: "LOGIN_EXPIRED"
          })
        }
      })
  }, [selectedChannelId, token, typedMessage, url, findMessage]);

  const scrollToLatest = useCallback(() => {
    if (messagesContainer.current !== null) {
      const scroll = messagesContainer.current.scrollHeight - messagesContainer.current.clientHeight;
      messagesContainer.current.scrollTo(0, scroll);
    }
  }, [messagesContainer]);

  useEffect(() => scrollToLatest(), [scrollToLatest]);

  const openAddChannel = () => {
    dispatch({
      type: "OPEN_ADD_CHANNEL_MODAL"
    });
  }

  const closeAddChannel = () => {
    dispatch({
      type: "CLOSE_ADD_CHANNEL_MODAL"
    });
  }

  const handleChannelNameChanges = (e) => {
    dispatch({
      type: "CHANNEL_NAME_CHANGE",
      channelName: e.target.value
    });
  }

  const addChannel = useCallback(() => {
    const body = {
      name: channelName
    };

    fetch(`${url}/channels`, {
      method: 'post',
      headers: new Headers({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify(body)
    })
      .then(res => {
        if (res.status === 200) {
          findChannel(token);
          dispatch({
            type: "CLOSE_ADD_CHANNEL_MODAL"
          })
        } else {
          dispatch({
            type: "LOGIN_EXPIRED"
          })
        }
      })
  }, [token, channelName, url, findChannel]);

  const deleteChannel = useCallback(id => {
    fetch(`${url}/channels/${id}`, {
      method: 'delete',
      headers: new Headers({
        'Authorization': `Bearer ${token}`
      })
    })
      .then(res => {
        if (res.status === 200) {
          findChannel(token);
        } else {
          dispatch({
            type: "LOGIN_EXPIRED"
          })
        }
      })
  }, [token, url, findChannel]);

  const updateChannel = useCallback((id, name) => {
    const body = {
      name: name
    };

    fetch(`${url}/channels/${id}`, {
      method: 'put',
      headers: new Headers({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify(body)
    })
      .then(res => {
        if (res.status === 200) {
          findChannel(token);
        } else {
          dispatch({
            type: "LOGIN_EXPIRED"
          })
        }
      })
  }, [token, url, findChannel]);

  const handleSearchWordChanges = (e) => {
    dispatch({
      type: "SEARCH_WORD_CHANGE",
      searchWord: e.target.value
    });
  }

  return (
    <Container>
      <Navbar bg='dark' variant='dark' fixed='top' className='navbar-header'>
        <Navbar.Brand>Chat App</Navbar.Brand>
        <Form className="d-flex">
          <FormControl
            type="text"
            placeholder="APIベースURL"
            className="bg-secondary me-4 navibar-header__url"
            value={url}
            onChange={handleUrlChanges}
          />
        </Form>
        {isLogin ?
          <React.Fragment>
            <Form className="d-flex navibar-header__search">
              <FormControl
                type="search"
                placeholder="Search"
                className="me-2"
                value={searchWord}
                onChange={handleSearchWordChanges}
              />
              <Button variant="outline-secondary" className='me-4 navibar-header__search__button' onClick={() => findMessage(selectedChannelId, searchWord)}>検索</Button>
            </Form>
            <Button variant="outline-secondary" className='navibar-header__logout ' onClick={logout}>ログアウト</Button>
          </React.Fragment>
          : <React.Fragment />}
      </Navbar>
      {isLogin ? (
        <Row>
          <Col xs={3}>
            <Navbar bg='light' variant='light'>
              <Navbar.Brand>チャンネル</Navbar.Brand>
              <Button className='channel-add' variant="outline-secondary" onClick={openAddChannel}>+</Button>
              <Modal show={showAddChannelModal} onHide={closeAddChannel}>
                <Modal.Header closeButton>
                  <Modal.Title>チャンネル追加</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <Form.Group className="mb-3" controlId="exampleForm.ControlInput5">
                    <Form.Label>チャンネル名</Form.Label>
                    <Form.Control type="text" value={channelName} onChange={handleChannelNameChanges} />
                  </Form.Group></Modal.Body>
                <Modal.Footer>
                  <Button variant="outline-secondary" onClick={addChannel}>
                    追加
                  </Button>
                </Modal.Footer>
              </Modal>
            </Navbar>
            <ListGroup>
              {(channels.map(channel =>
                <Channel channel={channel}
                  selectedChannelId={selectedChannelId}
                  selectChannel={(channelId) => setSelectedChannelId(channelId)}
                  deleteChannel={(channelId) => deleteChannel(channelId)}
                  updateChannel={(channelId, channelName) => updateChannel(channelId, channelName)}
                  key={channel.id} />))}
            </ListGroup>
          </Col>
          <Col>
            <Navbar bg='light' variant='light'>
              <Navbar.Brand>メッセージ</Navbar.Brand>
            </Navbar>
            <div className='messages' ref={messagesContainer}>
              {(messages.map(message => <Message message={message} key={message.id} />))}
            </div>
            <Navbar bg='light' variant='light' className='message-post'>
              <InputGroup className="mb-3">
                <FormControl placeholder="メッセージを投稿しよう" value={typedMessage} onChange={handleTypedMessageChanges} />
                <Button variant="outline-secondary" id="button-addon2" onClick={postMessage}>
                  投稿
                </Button>
              </InputGroup>
            </Navbar>
          </Col>
        </Row>
      ) : (
        <div className='login-form'>
          {infoMessage !== "" ?
            <Alert key="info" variant="info">
              {infoMessage}
            </Alert> :
            <React.Fragment />}
          {errorMessage !== "" ?
            <Alert key="danger" variant="danger">
              {errorMessage}
            </Alert> :
            <React.Fragment />}
          <Form>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Label>ユーザー名</Form.Label>
              <Form.Control type="text" value={username} onChange={handleUsernameChanges} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
              <Form.Label>パスワード</Form.Label>
              <Form.Control type="password" value={password} onChange={handlePasswordChanges} />
            </Form.Group>
          </Form>
          <div className='login-form__button'>
            <Button variant="outline-secondary" onClick={loginSkip}>ログインスキップ</Button>
            <Button variant="outline-secondary" onClick={signup}>サインアップ</Button>
            <Button variant="outline-secondary" onClick={login}>ログイン</Button>
          </div>
        </div>
      )}
    </Container>
  );
}

export default App;
