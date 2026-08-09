@ -126,23 +126,7 @@ export default function Homepage({ isRoomOnly = false }: { isRoomOnly?: boolean
    });
  };

  // 우체통 고정 좌표
  const getMailboxPosition = (
    imageW: number,
    imageH: number,
    boxW: number,
    boxH: number
  ) => {
    const pillarCenterX = imageW * 0.395;
    const floorLineY = imageH * 0.855;
    const deltaX = -15;
    const deltaY = +100;

    return {
      left: pillarCenterX - boxW / 2 + deltaX,
      top: floorLineY - boxH + deltaY,
    };
  };
  

  let roomBgKey = 'default';
  if (isLoaded && selectedRoom && backgroundMap[selectedRoom]) {
@ -228,24 +212,14 @@ export default function Homepage({ isRoomOnly = false }: { isRoomOnly?: boolean
          const data = furnitureList.find(f => f.id === item?.id);
          if (!data || !item) return null;

          let left = item.x;
          let top = item.y;

          // 📌 모든 가구는 이제 context에 저장된 x, y 좌표를 사용합니다.
          // mailbox 클릭 시 메뉴로 가는 로직만 유지합니다.
          if (item.id.startsWith('mailbox_')) {
            const pos = getMailboxPosition(
              imageScaledWidth,
              imageScaledHeight,
              (data.style as any).width,
              (data.style as any).height
            );
            left = pos.left;
            top = pos.top;

            return (
              <TouchableOpacity
                key={`furniture-${index}`}
                onPress={() => router.push('/Menu/Menupage')}
                style={{ position: 'absolute', left, top }}
                style={{ position: 'absolute', left: item.x, top: item.y }}
                activeOpacity={0.8}
              >
                <Image
@ -261,7 +235,7 @@ export default function Homepage({ isRoomOnly = false }: { isRoomOnly?: boolean
            <Image
              key={`furniture-${index}`}
              source={data.overlay}
              style={[{ position: 'absolute', left, top }, data.style]}
              style={[{ position: 'absolute', left: item.x, top: item.y }, data.style]}
              resizeMode="contain"
            />
          );
@ -288,17 +262,20 @@ export default function Homepage({ isRoomOnly = false }: { isRoomOnly?: boolean
        })}
      </ImageZoom>

      {/* 메뉴 버튼 */}
      <View style={styles.rightCircleWrapper}>
        <TouchableOpacity onPress={() => setShowDropdown(true)}>
          <Image
            source={require('../../assets/images/Modifiy/modifiedbutton.png')}
            style={styles.modifiedImageButton}
            resizeMode="contain"
          />
      {/* 메뉴 버튼들 */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={() => router.push('/Home_page/HelpPage')} style={styles.button}>
          <Text style={styles.buttonText}>?</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/Home_page/Roommodified/roommodified')} style={styles.button}>
          <Text style={styles.buttonText}>Room Modify</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/Mark/Shop/ShopPage')} style={styles.button}>
          <Text style={styles.buttonText}>Shop</Text>
        </TouchableOpacity>
      </View>


      {/* 드롭다운 */}
      <Modal
        transparent
@ -362,6 +339,22 @@ const styles = StyleSheet.create({
    left: 0,
    zIndex: 10,
  },
  buttonContainer: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 10,
    borderRadius: 20,
  },
  buttonText: {
    fontWeight: 'bold',
  },
  rightCircleWrapper: { position: 'absolute', right: 20, top: 100, zIndex: 10 },
  overlayPartial: {
    position: 'absolute', top: 0, left: 0, right: 0, height: '94%',
