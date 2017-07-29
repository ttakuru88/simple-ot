class NoteChannel < ApplicationCable::Channel
  @@operations = {}

  def subscribed
    stream_from "note_#{params[:id]}"
  end

  def unsubscribed
    @@operations[params[:id]] = []
  end

  def operation(data)
    @@operations[params[:id]] ||= []

    op = transform(params[:id], data)
    @@operations[params[:id]] << op # 本来はこのopをサーバー側で保存しているdocにapplyする

    broadcast_to_note(params[:id], data.merge(action: 'ack')) # ackは本人にのみ
    broadcast_to_note(params[:id], data.merge(operation: op.to_a)) # operationは本人以外に
  end

  def selection(data)
    broadcast_to_note(params[:id], data)
  end

  private

  def broadcast_to_note(note_id, data)
    ActionCable.server.broadcast("note_#{note_id}", data)
  end

  def transform(channel_id, data)
    # ユーザから来たoperationを、衝突を考慮したoperationに変換する
    op = OT::TextOperation.from_a(data['operation'])

    @@operations[channel_id][data['revision'].to_i-1..-1].to_a.inject(op) do |op1, op2|
      OT::TextOperation.transform(op1, op2)[0]
    end
  end
end
