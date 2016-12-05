defmodule ChatPhoenix.RoomChannel do
  use Phoenix.Channel

  # "rooms:lobby"トピックのjoin関数
  # {:ok, socket} を返すだけなのですべてのクライアントが接続可能
  def join("rooms:lobby", message, socket) do
    {:ok, socket}
  end

  def handle_in("new:message", message, socket) do
    # broadcat!は同じチャネルのすべてのサブスクライバーにメッセージを送る
    broadcast! socket, "new:message", %{user: message["user"], body: message["body"]}
    {:noreply, socket}
  end
end
