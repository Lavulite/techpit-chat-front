import { Card } from "react-bootstrap";


const Message = ({message}) => {
  const timestamp = new Date(message.timestamp);

  return (
    <Card>
      <Card.Body>
        <Card.Subtitle className="text-muted">{message.username}  <span className="fw-light">{timestamp.toLocaleString('ja-JP')}</span></Card.Subtitle>
        <Card.Text>{message.text}</Card.Text>
      </Card.Body>
    </Card>
  )
}

export default Message;