class NoteChannel < ApplicationCable::Channel
  def subscribed
    stream_from "note_#{params[:id]}"
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end

  def operation(data)
    ActionCable.server.broadcast("note_#{params[:id]}", {test: 123})
  end
end
