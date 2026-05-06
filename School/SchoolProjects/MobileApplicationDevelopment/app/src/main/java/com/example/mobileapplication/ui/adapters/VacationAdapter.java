import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import java.util.List;

public class VacationAdapter extends RecyclerView.Adapter<VacationAdapter.VacationViewHolder> {
    private List<Vacation> vacationList;

    public VacationAdapter(List<Vacation> vacationList) {
        this.vacationList = vacationList;
    }

    @NonNull
    @Override
    public VacationViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.vacation_list_item, parent, false);
        return new VacationViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull VacationViewHolder holder, int position) {
        Vacation vacation = vacationList.get(position);
        holder.textTitle.setText(vacation.getTitle());
        holder.textDestination.setText("Destination: " + vacation.getDestination());
        holder.textHotel.setText("Hotel: " + vacation.getHotel());
        holder.textDates.setText("Dates: " + vacation.getStartDate() + " - " + vacation.getEndDate());
    }

    @Override
    public int getItemCount() {
        return vacationList.size();
    }

    public static class VacationViewHolder extends RecyclerView.ViewHolder {
        TextView textTitle, textDestination, textHotel, textDates;

        public VacationViewHolder(View itemView) {
            super(itemView);
            textTitle = itemView.findViewById(R.id.textTitle);
            textDestination = itemView.findViewById(R.id.textDestination);
            textHotel = itemView.findViewById(R.id.textHotel);
            textDates = itemView.findViewById(R.id.textDates);
        }
    }
}
