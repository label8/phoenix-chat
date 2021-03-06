// Phoenisではデフォルトで"deps/phoenix/web/static/js/phoenix"に
// JSのSocketクラスが実装されています。そのSocketクラスをimportします。
import {Socket} from "../../../deps/phoenix/web/static/js/phoenix"

// チャットを行うクラス
class MySocket {

  // newのときに呼ばれるコンストラクタ
  constructor() {
    console.log("Initialized")

    // 入力フィールド
    this.$username = $("#username")
    this.$message  = $("#message")

    // 表示領域
    this.$messagesContainer = $("#messages")

    // キー入力イベントの登録
    this.$message.off("keypress").on("keypress", e => {
      if (e.keyCode === 13) { // 13: Enterキー
        // `${変数}` は式展開
        console.log(`[${this.$username.val()}]${this.$message.val()}`)
        // サーバーに"new:messege"というイベント名で、ユーザ名とメッセージを送る
        this.channel.push("new:message", { user: this.$username.val(), body: this.$message.val() })
        // メッセージの入力フィールドをクリア(空)にする
        this.$message.val("")
      }
    })
  }

  // ソケットに接続
  connectSocket(socket_path) {
    // "lib/chat_phoenix/endpoint.ex"　に定義してあるソケットパス("/socket")で
    // ソケットに接続すると、UserSocketに接続されます
    this.socket = new Socket(socket_path)
    this.socket.connect()
    this.socket.onClose( e => console.log("Closed connection") )
  }

  // チャネルに接続
  connectChannel(chanel_name) {
    this.channel = this.socket.channel(chanel_name, {})
    this.channel.join()
      .receive("ok", resp => { // チャネルに入れたときの処理
        console.log("Joined successfully", resp)
      })
      .receive("error", resp => { // チャネルに入れなかった時の処理
        console.log("Unable to join", resp)
      })
    // チャネルの"new:message"イベントを受け取った時のイベント処理
    this.channel.on("new:message", message => this._renderMessage(message) )
  }

  // メッセージを画面に表示
  _renderMessage(message) {
    let user = this._sanitize(message.user || "New User")
    let body = this._sanitize(message.body)

    this.$messagesContainer.append(`<p><b>[${user}]</b>: ${body}</p>`)
  }

  // メッセージをサニタイズする
  _sanitize(str) {
    return $("<div/>").text(str).html()
  }
}

$(
  () => {
    let my_socket = new MySocket()
    my_socket.connectSocket("/socket")
    my_socket.connectChannel("rooms:lobby")
  }
)

export default MySocket
