module AdminHelper
  def admin_nav_link(label, path, icon_name)
    is_root = path == admin_root_path
    active = is_root ? request.path == path : request.path.start_with?(path)
    css = active ? "nav-link active" : "nav-link"

    link_to path, class: css do
      content_tag(:i, nil, "data-lucide" => icon_name, class: "w-4 h-4") +
      content_tag(:span, label)
    end
  end

  def status_badge(status)
    styles = {
      "active" => "bg-emerald-50 text-emerald-700 border-emerald-200",
      "pending_verification" => "bg-amber-50 text-amber-700 border-amber-200",
      "in_relationship" => "bg-blue-50 text-blue-700 border-blue-200",
      "graduated" => "bg-violet-50 text-violet-700 border-violet-200",
      "suspended" => "bg-red-50 text-red-700 border-red-200",
      "dormant" => "bg-neutral-100 text-neutral-600 border-neutral-200",
    }
    labels = {
      "active" => "활성",
      "pending_verification" => "인증 대기",
      "in_relationship" => "연애 중",
      "graduated" => "졸업",
      "suspended" => "정지",
      "dormant" => "휴면",
    }
    css = styles[status] || "bg-neutral-100 text-neutral-600 border-neutral-200"
    content_tag(:span, labels[status] || status, class: "shadcn-badge border #{css}")
  end

  def verification_badge(level)
    styles = {
      "basic" => "bg-neutral-100 text-neutral-500 border-neutral-200",
      "phone_verified" => "bg-blue-50 text-blue-700 border-blue-200",
      "selfie_verified" => "bg-emerald-50 text-emerald-700 border-emerald-200",
      "profile_verified" => "bg-emerald-50 text-emerald-700 border-emerald-200",
      "fully_verified" => "bg-amber-50 text-amber-700 border-amber-200",
    }
    labels = {
      "basic" => "기본",
      "phone_verified" => "본인확인",
      "selfie_verified" => "얼굴확인",
      "profile_verified" => "프로필확인",
      "fully_verified" => "신뢰확인",
    }
    css = styles[level] || "bg-neutral-100 text-neutral-500 border-neutral-200"
    content_tag(:span, labels[level] || level, class: "shadcn-badge border #{css}")
  end

  def report_type_label(type)
    {
      "fake_profile" => "허위 프로필",
      "scam" => "사기/금전 요구",
      "harassment" => "성희롱/괴롭힘",
      "inappropriate_photo" => "부적절한 사진",
      "external_solicitation" => "외부 유도/광고",
      "married_suspect" => "기혼 의심",
      "other" => "기타",
    }[type] || type
  end

  def report_status_badge(status)
    styles = {
      "submitted" => "bg-red-50 text-red-700 border-red-200",
      "reviewing" => "bg-amber-50 text-amber-700 border-amber-200",
      "resolved" => "bg-emerald-50 text-emerald-700 border-emerald-200",
      "dismissed" => "bg-neutral-100 text-neutral-600 border-neutral-200",
    }
    labels = {
      "submitted" => "미처리",
      "reviewing" => "처리 중",
      "resolved" => "완료",
      "dismissed" => "반려",
    }
    css = styles[status] || "bg-neutral-100 text-neutral-600 border-neutral-200"
    content_tag(:span, labels[status] || status, class: "shadcn-badge border #{css}")
  end

  def sanction_type_label(type)
    {
      "warning" => "경고",
      "feature_restriction" => "기능 제한",
      "reauth_required" => "인증 재요청",
      "temporary_suspension" => "일시 정지",
      "permanent_suspension" => "영구 정지",
      "forced_dormant" => "강제 휴면",
    }[type] || type
  end

  def time_ago_short(time)
    return "-" unless time
    distance = Time.current - time
    if distance < 60
      "방금"
    elsif distance < 3600
      "#{(distance / 60).to_i}분 전"
    elsif distance < 86400
      "#{(distance / 3600).to_i}시간 전"
    else
      "#{(distance / 86400).to_i}일 전"
    end
  end
end
