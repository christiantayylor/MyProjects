import androidx.room.Entity;
import androidx.room.PrimaryKey;

@Entity(tableName = "vacation_table")
public class Vacation {
    @PrimaryKey(autoGenerate = true)
    private int id;
    private String title;
    private String destination;
    private String hotel;
    private String startDate;
    private String endDate;

    public Vacation(String title, String destination, String hotel, String startDate, String endDate) {
        this.title = title;
        this.destination = destination;
        this.hotel = hotel;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getTitle() { return title; }
    public String getDestination() { return destination; }
    public String getHotel() { return hotel; }
    public String getStartDate() { return startDate; }
    public String getEndDate() { return endDate; }
}
