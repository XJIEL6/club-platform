export default function StartModal({ open, onClose, onConfirm }) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h3>开始匹配问卷</h3>
        <p>问卷共 7 步，约 3-5 分钟。完成后可查看 AI 推荐和全部社团。</p>
        <div className="modal-actions">
          <button className="btn ghost" onClick={onClose}>取消</button>
          <button className="btn primary" onClick={onConfirm}>进入问卷</button>
        </div>
      </div>
    </div>
  );
}
