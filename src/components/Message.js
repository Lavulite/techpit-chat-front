import "./Message.scss";
import { BsPersonCircle } from "react-icons/bs";


const Message = ({ message }) => {
  const timestamp = new Date(message.timestamp);

  return (
    <div className="message">
      <div className="message-icon">
        <BsPersonCircle size="1.5em" />
      </div>
      <div className="message-body">
        <div>
          <span className="message-username">{message.username}</span>
          <span className="fw-light">{timestamp.toLocaleString('ja-JP')}</span>
        </div>
        <p>{message.text}</p>
      </div>
    </div>
  )
}

export default Message;