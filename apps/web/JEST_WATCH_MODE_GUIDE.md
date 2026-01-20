

## 📝 Ví Dụ Cụ Thể

### Test names trong project:

```typescript
// FeeTierDialog.test.tsx
"nên hiển thị đúng title và description"
"nên khởi tạo form với giá trị mặc định"
"nên hiển thị button Tạo Mới"
"nên gọi onSubmit với dữ liệu đúng"

// FeeTierTable.test.tsx
"should render table with fee tiers"
"should call onAddTier when add button is clicked"
"should display empty message when no fee tiers"

// FeeTierStatsCards.test.tsx
"should render total count correctly"
"should render active count correctly"
```

### Dùng `t` để filter:

```
> Pattern › nên hiển thị
```
→ Chỉ chạy test có tên chứa "nên hiển thị"

```
> Pattern › should render
```
→ Chỉ chạy test có tên chứa "should render"

```
> Pattern › onSubmit
```
→ Chỉ chạy test liên quan đến onSubmit

## ✅ Best Practices

1. **Dùng `t` khi:**
   - Muốn test một hành vi cụ thể
   - Đang debug một test case
   - Muốn chạy test theo chức năng

2. **Dùng `p` khi:**
   - Muốn test một component/file cụ thể
   - Đang làm việc với một module

3. **Dùng `f` khi:**
   - Có test đang fail
   - Muốn focus vào sửa lỗi

4. **Dùng `a` khi:**
   - Muốn chạy tất cả test
   - Muốn clear filter

## 🎉 Kết Luận

**Chức năng `t`** giúp bạn:
- ✅ Chạy test nhanh hơn (chỉ test cần thiết)
- ✅ Focus vào một chức năng cụ thể
- ✅ Debug dễ dàng hơn
- ✅ Tiết kiệm thời gian khi đang viết test

**Cách nhớ:** `t` = **T**est name pattern
